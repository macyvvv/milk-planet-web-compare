import "server-only";
import { db } from "@/lib/db";
import {
  CsvJobType,
  CsvImportStatus,
  CsvRowStatus,
  ConfirmedShiftStatus,
} from "@/app/generated/prisma/client";
import { parseCsvText } from "./csv-utils";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

export const CONFIRMED_SHIFT_IMPORT_COLUMNS = ["login_name", "store_name", "period_start_date", "work_date", "start_time", "end_time", "cast_note", "admin_note"] as const;

interface ConfirmedShiftImportRowData {
  login_name: string;
  store_name: string;
  period_start_date: string; // YYYY-MM-DD
  work_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  cast_note: string;
  admin_note: string;
}

export interface UploadConfirmedShiftsCsvInput {
  csvText: string;
  uploadedById: string;
}

export async function uploadConfirmedShiftsCsv(input: UploadConfirmedShiftsCsvInput) {
  const job = await db.csvImportJob.create({
    data: { jobType: CsvJobType.CONFIRMED_SHIFTS, status: CsvImportStatus.VALIDATING, uploadedById: input.uploadedById },
  });

  const { data, errors: parseErrors } = parseCsvText(input.csvText);

  if (parseErrors.length > 0 || data.length === 0) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: { status: CsvImportStatus.VALIDATION_FAILED, errorSummary: parseErrors.join(" / ") || "データ行がありません。" },
    });
    return job.id;
  }

  const headerOk = CONFIRMED_SHIFT_IMPORT_COLUMNS.every((col) => Object.keys(data[0]).includes(col));
  if (!headerOk) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: { status: CsvImportStatus.VALIDATION_FAILED, errorSummary: `ヘッダーが不正です。必要な列: ${CONFIRMED_SHIFT_IMPORT_COLUMNS.join(", ")}` },
    });
    return job.id;
  }

  const stores = await db.store.findMany();
  const storeByName = new Map(stores.map((s) => [s.name, s]));
  const users = await db.user.findMany({ select: { id: true, loginName: true } });
  const userByLoginName = new Map(users.map((u) => [u.loginName, u]));
  const periods = await db.period.findMany();

  // Format dates for map key comparison
  const periodMap = new Map(periods.map((p) => [p.startDate.toISOString().split("T")[0], p]));

  let anyInvalid = false;

  for (let i = 0; i < data.length; i++) {
    const raw = data[i] as unknown as ConfirmedShiftImportRowData;
    const rowErrors: string[] = [];

    if (!raw.login_name?.trim()) rowErrors.push("login_nameが空です。");
    else if (!userByLoginName.has(raw.login_name.trim())) rowErrors.push(`ユーザー「${raw.login_name}」が存在しません。`);

    if (!raw.store_name?.trim()) rowErrors.push("store_nameが空です。");
    else if (!storeByName.has(raw.store_name.trim())) rowErrors.push(`店舗「${raw.store_name}」が存在しません。`);

    if (!raw.period_start_date?.trim() || isNaN(Date.parse(raw.period_start_date.trim()))) {
      rowErrors.push("period_start_dateが不正です（YYYY-MM-DD形式）。");
    } else {
      const periodKey = new Date(raw.period_start_date.trim()).toISOString().split("T")[0];
      if (!periodMap.has(periodKey)) {
         rowErrors.push(`開始日が「${periodKey}」のピリオドが存在しません。`);
      }
    }

    if (!raw.work_date?.trim() || isNaN(Date.parse(raw.work_date.trim()))) {
      rowErrors.push("work_dateが不正です（YYYY-MM-DD形式）。");
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-9]):[0-5][0-9]$/; // Allow 00:00 to 29:59 conceptually if needed, but let's check basic format
    if (!raw.start_time?.trim() || !timeRegex.test(raw.start_time.trim())) rowErrors.push("start_timeが不正です（HH:MM形式）。");
    if (!raw.end_time?.trim() || !timeRegex.test(raw.end_time.trim())) rowErrors.push("end_timeが不正です（HH:MM形式）。");

    const status = rowErrors.length > 0 ? CsvRowStatus.INVALID : CsvRowStatus.VALID;
    if (status === CsvRowStatus.INVALID) anyInvalid = true;

    await db.csvImportRow.create({
      data: {
        jobId: job.id,
        rowNo: i + 1,
        rawData: JSON.stringify(raw),
        validationErrors: rowErrors.length > 0 ? JSON.stringify(rowErrors) : undefined,
        status,
      },
    });
  }

  await db.csvImportJob.update({
    where: { id: job.id },
    data: { status: anyInvalid ? CsvImportStatus.VALIDATION_FAILED : CsvImportStatus.PREVIEW_READY },
  });

  return job.id;
}

export interface ApplyConfirmedShiftsCsvInput {
  jobId: string;
  actorUserId: string;
  ctx: RequestContext;
}

export async function applyConfirmedShiftsCsv(input: ApplyConfirmedShiftsCsvInput): Promise<number> {
  const job = await db.csvImportJob.findUniqueOrThrow({ where: { id: input.jobId }, include: { rows: true } });

  if (job.status !== CsvImportStatus.PREVIEW_READY) throw new Error("このジョブは確定可能な状態ではありません。");
  if (job.rows.some((r) => r.status === CsvRowStatus.INVALID)) throw new Error("無効な行が含まれています。");

  const stores = await db.store.findMany();
  const storeByName = new Map(stores.map((s) => [s.name, s]));
  const users = await db.user.findMany({ select: { id: true, loginName: true } });
  const userByLoginName = new Map(users.map((u) => [u.loginName, u]));
  const periods = await db.period.findMany();
  const periodMap = new Map(periods.map((p) => [p.startDate.toISOString().split("T")[0], p]));

  let count = 0;

  await db.$transaction(async (tx) => {
    for (const row of job.rows) {
      const raw = row.rawData as unknown as ConfirmedShiftImportRowData;
      const store = storeByName.get(raw.store_name.trim())!;
      const user = userByLoginName.get(raw.login_name.trim())!;
      const periodKey = new Date(raw.period_start_date.trim()).toISOString().split("T")[0];
      const period = periodMap.get(periodKey)!;
      const workDate = new Date(raw.work_date.trim());

      const startParts = raw.start_time.trim().split(":");
      const startAt = new Date(workDate);
      startAt.setUTCHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0);

      const endParts = raw.end_time.trim().split(":");
      const endAt = new Date(workDate);
      endAt.setUTCHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0);

      await tx.confirmedShift.create({
        data: {
          periodId: period.id,
          storeId: store.id,
          userId: user.id,
          workDate: workDate,
          startAt: startAt,
          endAt: endAt,
          status: ConfirmedShiftStatus.CONFIRMED,
          castNote: raw.cast_note?.trim() || null,
          adminNote: raw.admin_note?.trim() || null,
          createdById: input.actorUserId,
          updatedById: input.actorUserId,
        },
      });
      count++;
    }

    await tx.csvImportJob.update({
      where: { id: job.id },
      data: { status: CsvImportStatus.APPLIED, appliedById: input.actorUserId, appliedAt: new Date() },
    });

    await recordAuditLog({
      actorUserId: input.actorUserId,
      action: AUDIT_ACTIONS.CSV_IMPORT_APPLIED,
      entityType: "CsvImportJob",
      entityId: job.id,
      afterData: { rowCount: job.rows.length },
      ipAddress: input.ctx.ipAddress,
      userAgent: input.ctx.userAgent,
    }, tx);
  });

  return count;
}
