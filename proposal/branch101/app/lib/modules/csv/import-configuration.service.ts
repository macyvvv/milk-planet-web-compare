import "server-only";
import {
  CsvImportStatus,
  CsvJobType,
  CsvRowStatus,
  NotificationTemplateType,
  TargetStatus,
} from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import type { RequestContext } from "@/lib/modules/auth/session";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { csvRowData, parseCsvText } from "./csv-utils";

export type ConfigurationCsvKind = "PERIOD_CAST_TARGETS" | "NOTIFICATION_TEMPLATES";

export const CONFIGURATION_IMPORT_COLUMNS: Record<ConfigurationCsvKind, readonly string[]> = {
  PERIOD_CAST_TARGETS: [
    "operation",
    "period_start_date",
    "store_code",
    "user_id",
    "login_name",
    "target_status",
    "exclusion_reason",
  ],
  NOTIFICATION_TEMPLATES: ["operation", "template_type", "store_code", "body"],
};

const targetStatuses = new Set(Object.values(TargetStatus));
const templateTypes = new Set(Object.values(NotificationTemplateType));

export async function uploadConfigurationCsv(input: {
  kind: ConfigurationCsvKind;
  csvText: string;
  uploadedById: string;
}) {
  const job = await db.csvImportJob.create({
    data: {
      jobType: input.kind,
      status: CsvImportStatus.VALIDATING,
      uploadedById: input.uploadedById,
    },
  });
  const parsed = parseCsvText(input.csvText);
  const columns = CONFIGURATION_IMPORT_COLUMNS[input.kind];
  if (
    parsed.errors.length ||
    !parsed.data.length ||
    !columns.every((column) => Object.hasOwn(parsed.data[0], column))
  ) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: {
        status: CsvImportStatus.VALIDATION_FAILED,
        errorSummary:
          parsed.errors.join(" / ") ||
          (!parsed.data.length
            ? "データ行がありません。"
            : `ヘッダーが不正です。必要な列: ${columns.join(", ")}`),
      },
    });
    return job.id;
  }

  const [stores, periods, users] = await Promise.all([
    db.store.findMany({ select: { code: true } }),
    db.period.findMany({ select: { startDate: true } }),
    db.user.findMany({ select: { id: true, loginName: true } }),
  ]);
  const storeCodes = new Set(stores.map((store) => store.code));
  const periodStarts = new Set(periods.map((period) => period.startDate.toISOString().slice(0, 10)));
  const userIds = new Set(users.map((user) => user.id));
  const loginNames = new Set(users.map((user) => user.loginName));
  let invalid = false;

  for (const [index, value] of parsed.data.entries()) {
    const raw = value as Record<string, string>;
    const errors: string[] = [];
    if (String(raw.operation).trim().toUpperCase() !== "UPSERT") errors.push("operationはUPSERTです。");
    if (input.kind === "PERIOD_CAST_TARGETS") {
      if (!periodStarts.has(String(raw.period_start_date).trim())) errors.push("period_start_dateが存在しません。");
      if (!storeCodes.has(String(raw.store_code).trim())) errors.push("store_codeが存在しません。");
      const userId = String(raw.user_id).trim();
      const loginName = String(raw.login_name).trim();
      if (!userId && !loginName) errors.push("user_idまたはlogin_nameが必要です。");
      if (userId && !userIds.has(userId)) errors.push("user_idが存在しません。");
      if (!userId && loginName && !loginNames.has(loginName)) errors.push("login_nameが存在しません。");
      if (!targetStatuses.has(String(raw.target_status).trim() as TargetStatus)) {
        errors.push("target_statusが不正です。");
      }
      if (
        String(raw.target_status).trim() !== TargetStatus.ACTIVE &&
        !String(raw.exclusion_reason).trim()
      ) {
        errors.push("除外対象にはexclusion_reasonが必要です。");
      }
    } else {
      const templateType = String(raw.template_type).trim() as NotificationTemplateType;
      if (!templateTypes.has(templateType)) errors.push("template_typeが不正です。");
      const storeCode = String(raw.store_code).trim();
      if (storeCode && !storeCodes.has(storeCode)) errors.push("store_codeが存在しません。");
      if (templateType === NotificationTemplateType.STORE_UNSUBMITTED && !storeCode) {
        errors.push("STORE_UNSUBMITTEDにはstore_codeが必要です。");
      }
      if (templateType !== NotificationTemplateType.STORE_UNSUBMITTED && storeCode) {
        errors.push("全体テンプレートのstore_codeは空欄です。");
      }
      if (!String(raw.body).trim()) errors.push("bodyが空です。");
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

export async function applyConfigurationCsv(input: {
  jobId: string;
  actorUserId: string;
  ctx: RequestContext;
}) {
  const job = await db.csvImportJob.findUniqueOrThrow({
    where: { id: input.jobId },
    include: { rows: { orderBy: { rowNo: "asc" } } },
  });
  if (job.status !== CsvImportStatus.PREVIEW_READY) throw new Error("確定可能な状態ではありません。");

  await db.$transaction(async (tx) => {
    for (const row of job.rows) {
      const raw = csvRowData<Record<string, string>>(row.rawData);
      if (job.jobType === CsvJobType.PERIOD_CAST_TARGETS) {
        const period = await tx.period.findFirstOrThrow({
          where: { startDate: new Date(raw.period_start_date) },
        });
        const store = await tx.store.findUniqueOrThrow({ where: { code: raw.store_code.trim() } });
        const user = raw.user_id.trim()
          ? await tx.user.findUniqueOrThrow({ where: { id: raw.user_id.trim() } })
          : await tx.user.findFirstOrThrow({ where: { loginName: raw.login_name.trim() } });
        await tx.periodCastTarget.upsert({
          where: { periodId_storeId_userId: { periodId: period.id, storeId: store.id, userId: user.id } },
          create: {
            periodId: period.id,
            storeId: store.id,
            userId: user.id,
            targetStatus: raw.target_status as TargetStatus,
            exclusionReason: raw.exclusion_reason.trim() || null,
            updatedById: input.actorUserId,
          },
          update: {
            targetStatus: raw.target_status as TargetStatus,
            exclusionReason: raw.exclusion_reason.trim() || null,
            updatedById: input.actorUserId,
          },
        });
      } else {
        const templateType = raw.template_type as NotificationTemplateType;
        const store = raw.store_code.trim()
          ? await tx.store.findUniqueOrThrow({ where: { code: raw.store_code.trim() } })
          : null;
        const existing = await tx.notificationTemplate.findFirst({
          where: { templateType, storeId: store?.id ?? null },
        });
        if (existing) {
          await tx.notificationTemplate.update({
            where: { id: existing.id },
            data: { body: raw.body, updatedById: input.actorUserId },
          });
        } else {
          await tx.notificationTemplate.create({
            data: {
              templateType,
              storeId: store?.id ?? null,
              body: raw.body,
              updatedById: input.actorUserId,
            },
          });
        }
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
