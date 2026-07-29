import "server-only";
import {
  CsvImportStatus,
  CsvJobType,
  CsvRowStatus,
  StoreStatus,
} from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { csvRowData, parseCsvText } from "./csv-utils";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

export type MasterCsvKind = "STORES" | "STANDARD_SHIFTS" | "PERIOD_SETTINGS";

const COLUMNS: Record<MasterCsvKind, readonly string[]> = {
  STORES: ["operation", "name", "status"],
  STANDARD_SHIFTS: [
    "operation",
    "login_name",
    "day_of_week",
    "is_working",
    "start_time",
    "end_time",
    "note",
  ],
  PERIOD_SETTINGS: [
    "operation",
    "period_start_date",
    "store_name",
    "submission_open_at",
    "submission_deadline_at",
  ],
};

const minutes = (value: string) => {
  const match = /^(\d{1,2}):([03]0)$/.exec(value);
  if (!match) return null;
  const result = Number(match[1]) * 60 + Number(match[2]);
  return result <= 1800 ? result : null;
};

export async function uploadMasterCsv(input: {
  kind: MasterCsvKind;
  csvText: string;
  uploadedById: string;
}) {
  const job = await db.csvImportJob.create({
    data: {
      jobType: input.kind as CsvJobType,
      status: CsvImportStatus.VALIDATING,
      uploadedById: input.uploadedById,
    },
  });
  const parsed = parseCsvText(input.csvText);
  if (parsed.errors.length || !parsed.data.length) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: {
        status: CsvImportStatus.VALIDATION_FAILED,
        errorSummary: parsed.errors.join(" / ") || "データ行がありません。",
      },
    });
    return job.id;
  }
  const required = COLUMNS[input.kind];
  if (!required.every((column) => Object.hasOwn(parsed.data[0], column))) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: {
        status: CsvImportStatus.VALIDATION_FAILED,
        errorSummary: `ヘッダーが不正です。必要な列: ${required.join(", ")}`,
      },
    });
    return job.id;
  }
  const [users, stores, periods] = await Promise.all([
    db.user.findMany({ select: { loginName: true } }),
    db.store.findMany({ select: { name: true } }),
    db.period.findMany({ select: { startDate: true } }),
  ]);
  const loginNames = new Set(users.map((user) => user.loginName));
  const storeNames = new Set(stores.map((store) => store.name));
  const periodStarts = new Set(periods.map((period) => period.startDate.toISOString().slice(0, 10)));
  let invalid = false;
  for (const [index, raw] of parsed.data.entries()) {
    const errors: string[] = [];
    if (String(raw.operation ?? "").toUpperCase() !== "UPSERT") errors.push("operationはUPSERTです。");
    if (input.kind === "STORES") {
      if (!String(raw.name ?? "").trim()) errors.push("nameが空です。");
      if (!["ACTIVE", "INACTIVE"].includes(String(raw.status ?? ""))) errors.push("statusが不正です。");
    } else if (input.kind === "STANDARD_SHIFTS") {
      if (!loginNames.has(String(raw.login_name ?? "").trim())) errors.push("login_nameが存在しません。");
      const day = Number(raw.day_of_week);
      if (!Number.isInteger(day) || day < 0 || day > 6) errors.push("day_of_weekは0〜6です。");
      const working = String(raw.is_working).toLowerCase() === "true";
      if (working && (minutes(String(raw.start_time)) == null || minutes(String(raw.end_time)) == null)) {
        errors.push("勤務日はstart_time/end_timeをHH:MMで指定してください。");
      }
    } else {
      if (!periodStarts.has(String(raw.period_start_date ?? ""))) errors.push("period_start_dateが存在しません。");
      if (!storeNames.has(String(raw.store_name ?? "").trim())) errors.push("store_nameが存在しません。");
      const open = new Date(String(raw.submission_open_at));
      const deadline = new Date(String(raw.submission_deadline_at));
      if (Number.isNaN(open.getTime()) || Number.isNaN(deadline.getTime()) || deadline <= open) {
        errors.push("受付開始・締切日時が不正です。");
      }
    }
    invalid ||= errors.length > 0;
    await db.csvImportRow.create({
      data: {
        jobId: job.id,
        rowNo: index + 1,
        rawData: JSON.stringify(raw),
        validationErrors: errors.length ? JSON.stringify(errors) : undefined,
        status: errors.length ? CsvRowStatus.INVALID : CsvRowStatus.VALID,
      },
    });
  }
  await db.csvImportJob.update({
    where: { id: job.id },
    data: { status: invalid ? CsvImportStatus.VALIDATION_FAILED : CsvImportStatus.PREVIEW_READY },
  });
  return job.id;
}

export async function applyMasterCsv(input: {
  jobId: string;
  actorUserId: string;
  ctx: RequestContext;
}) {
  const job = await db.csvImportJob.findUniqueOrThrow({
    where: { id: input.jobId },
    include: { rows: true },
  });
  if (job.status !== CsvImportStatus.PREVIEW_READY) throw new Error("確定可能な状態ではありません。");
  await db.$transaction(async (tx) => {
    for (const row of job.rows) {
      const raw = csvRowData<Record<string, string>>(row.rawData);
      if (job.jobType === CsvJobType.STORES) {
        const existing = await tx.store.findFirst({ where: { name: raw.name.trim() } });
        if (existing) {
          await tx.store.update({
            where: { id: existing.id },
            data: { status: raw.status as StoreStatus },
          });
        } else {
          await tx.store.create({ data: { name: raw.name.trim(), status: raw.status as StoreStatus } });
        }
      } else if (job.jobType === CsvJobType.STANDARD_SHIFTS) {
        const user = await tx.user.findFirstOrThrow({ where: { loginName: raw.login_name.trim() } });
        const working = raw.is_working.toLowerCase() === "true";
        await tx.standardShiftPattern.upsert({
          where: { userId_dayOfWeek: { userId: user.id, dayOfWeek: Number(raw.day_of_week) } },
          create: {
            userId: user.id,
            dayOfWeek: Number(raw.day_of_week),
            isWorking: working,
            startMinutes: working ? minutes(raw.start_time) : null,
            endMinutes: working ? minutes(raw.end_time) : null,
            note: raw.note?.trim() || null,
          },
          update: {
            isWorking: working,
            startMinutes: working ? minutes(raw.start_time) : null,
            endMinutes: working ? minutes(raw.end_time) : null,
            note: raw.note?.trim() || null,
          },
        });
      } else if (job.jobType === CsvJobType.PERIOD_SETTINGS) {
        const period = await tx.period.findFirstOrThrow({
          where: { startDate: new Date(raw.period_start_date) },
        });
        const store = await tx.store.findFirstOrThrow({ where: { name: raw.store_name.trim() } });
        await tx.periodStoreSetting.upsert({
          where: { periodId_storeId: { periodId: period.id, storeId: store.id } },
          create: {
            periodId: period.id,
            storeId: store.id,
            submissionOpenAt: new Date(raw.submission_open_at),
            submissionDeadlineAt: new Date(raw.submission_deadline_at),
          },
          update: {
            submissionOpenAt: new Date(raw.submission_open_at),
            submissionDeadlineAt: new Date(raw.submission_deadline_at),
          },
        });
      }
    }
    await tx.csvImportJob.update({
      where: { id: job.id },
      data: { status: CsvImportStatus.APPLIED, appliedById: input.actorUserId, appliedAt: new Date() },
    });
    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.CSV_IMPORT_APPLIED,
        entityType: "CsvImportJob",
        entityId: job.id,
        afterData: { rowCount: job.rows.length, jobType: job.jobType },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );
  });
}
