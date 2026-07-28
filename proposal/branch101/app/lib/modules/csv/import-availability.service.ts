import "server-only";
import { db } from "@/lib/db";
import {
  AvailabilityStatus,
  CsvJobType,
  CsvImportStatus,
  CsvRowStatus,
  type Prisma,
} from "@/app/generated/prisma/client";
import { parseCsvText } from "./csv-utils";
import { businessTimeToDate, parseBusinessTime } from "@/lib/modules/availability/business-time";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

// REQ-CSV-004: 緊急復旧・移行用、SUPER_USER限定、理由必須。「代理入力禁止」の抜け道にしない。
export const AVAILABILITY_IMPORT_COLUMNS = [
  "login_name",
  "target_date",
  "availability_status",
  "start_time",
  "end_time",
  "note",
] as const;

interface AvailabilityImportRowData {
  login_name: string;
  target_date: string;
  availability_status: string;
  start_time: string;
  end_time: string;
  note: string;
}

export interface UploadAvailabilityCsvInput {
  csvText: string;
  periodId: string;
  storeId: string;
  reason: string;
  uploadedById: string;
}

export async function uploadAvailabilityCsv(input: UploadAvailabilityCsvInput): Promise<string> {
  const job = await db.csvImportJob.create({
    data: {
      jobType: CsvJobType.AVAILABILITY,
      periodId: input.periodId,
      storeId: input.storeId,
      reason: input.reason,
      status: CsvImportStatus.VALIDATING,
      uploadedById: input.uploadedById,
    },
  });

  const { data, errors: parseErrors } = parseCsvText(input.csvText);
  if (parseErrors.length > 0 || data.length === 0) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: {
        status: CsvImportStatus.VALIDATION_FAILED,
        errorSummary: parseErrors.join(" / ") || "データ行がありません。",
      },
    });
    return job.id;
  }

  const period = await db.period.findUniqueOrThrow({ where: { id: input.periodId } });
  const targets = await db.periodCastTarget.findMany({
    where: { periodId: input.periodId, storeId: input.storeId },
    include: { user: true },
  });
  const userByLoginName = new Map(targets.map((t) => [t.user.loginName, t.userId]));
  const statuses = new Set(Object.values(AvailabilityStatus));

  let anyInvalid = false;
  for (let i = 0; i < data.length; i++) {
    const raw = data[i] as unknown as AvailabilityImportRowData;
    const rowErrors: string[] = [];

    const userId = userByLoginName.get(raw.login_name?.trim());
    if (!userId) rowErrors.push("この店舗・ピリオドの対象キャストに存在しないlogin_nameです。");

    const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(raw.target_date?.trim() ?? "")
      ? new Date(`${raw.target_date.trim()}T00:00:00.000Z`)
      : null;
    if (!targetDate || targetDate < period.startDate || targetDate > period.endDate) {
      rowErrors.push("target_dateがピリオド範囲外、または形式不正です(YYYY-MM-DD)。");
    }

    if (!statuses.has(raw.availability_status?.trim() as AvailabilityStatus)) {
      rowErrors.push(`availability_statusが不正です(${Array.from(statuses).join("/")})。`);
    } else if (raw.availability_status.trim() !== "OFF") {
      if (!parseBusinessTime(raw.start_time ?? "") || !parseBusinessTime(raw.end_time ?? "")) {
        rowErrors.push("start_time/end_timeの形式が不正です(例: 19:00, 最大30:00)。");
      }
    }

    const status = rowErrors.length > 0 ? CsvRowStatus.INVALID : CsvRowStatus.VALID;
    if (status === CsvRowStatus.INVALID) anyInvalid = true;

    await db.csvImportRow.create({
      data: {
        jobId: job.id,
        rowNo: i + 1,
        rawData: raw as unknown as Prisma.InputJsonValue,
        validationErrors: rowErrors.length > 0 ? rowErrors : undefined,
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

export interface ApplyAvailabilityCsvInput {
  jobId: string;
  actorUserId: string;
  ctx: RequestContext;
}

/** REQ-CSV-003,004: 全行有効な場合のみ、単一トランザクションで反映する。 */
export async function applyAvailabilityCsv(input: ApplyAvailabilityCsvInput): Promise<number> {
  const job = await db.csvImportJob.findUniqueOrThrow({ where: { id: input.jobId }, include: { rows: true } });
  if (job.status !== CsvImportStatus.PREVIEW_READY) {
    throw new Error("このジョブは確定可能な状態ではありません。");
  }
  if (job.rows.some((r) => r.status === CsvRowStatus.INVALID)) {
    throw new Error("無効な行が含まれています。全行が有効な状態でのみ反映できます。");
  }
  if (!job.periodId || !job.storeId) {
    throw new Error("対象ピリオド・店舗が不正です。");
  }

  const targets = await db.periodCastTarget.findMany({
    where: { periodId: job.periodId, storeId: job.storeId },
    include: { user: true },
  });
  const userByLoginName = new Map(targets.map((t) => [t.user.loginName, t.userId]));

  await db.$transaction(async (tx) => {
    for (const row of job.rows) {
      const raw = row.rawData as unknown as AvailabilityImportRowData;
      const userId = userByLoginName.get(raw.login_name.trim())!;
      const targetDate = new Date(`${raw.target_date.trim()}T00:00:00.000Z`);
      const status = raw.availability_status.trim() as AvailabilityStatus;

      const submission = await tx.availabilitySubmission.upsert({
        where: { periodId_storeId_userId: { periodId: job.periodId!, storeId: job.storeId!, userId } },
        create: { periodId: job.periodId!, storeId: job.storeId!, userId },
        update: {},
      });

      const startAt = status !== "OFF" ? businessTimeToDate(targetDate, parseBusinessTime(raw.start_time)!) : null;
      const endAt = status !== "OFF" ? businessTimeToDate(targetDate, parseBusinessTime(raw.end_time)!) : null;

      await tx.availabilityEntry.upsert({
        where: { submissionId_targetDate: { submissionId: submission.id, targetDate } },
        create: { submissionId: submission.id, targetDate, availabilityStatus: status, startAt, endAt, note: raw.note || null },
        update: { availabilityStatus: status, startAt, endAt, note: raw.note || null },
      });
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
        storeId: job.storeId,
        periodId: job.periodId,
        reason: job.reason,
        afterData: { rowCount: job.rows.length },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );
  });

  return job.rows.length;
}
