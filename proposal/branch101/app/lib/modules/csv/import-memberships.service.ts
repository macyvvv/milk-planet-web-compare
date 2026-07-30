import "server-only";
import { db } from "@/lib/db";
import {
  CsvJobType,
  CsvImportStatus,
  CsvRowStatus,
  MembershipType,
} from "@/app/generated/prisma/client";
import { csvRowData, parseCsvText } from "./csv-utils";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

export const MEMBERSHIP_IMPORT_COLUMNS = ["operation", "login_name", "store_code", "valid_from", "valid_to", "membership_type"] as const;

interface MembershipImportRowData {
  operation: string;
  login_name: string;
  store_code: string;
  valid_from: string; // YYYY-MM-DD
  valid_to: string; // YYYY-MM-DD or empty
  membership_type: string; // PRIMARY or TEMPORARY
}

export interface UploadMembershipsCsvInput {
  csvText: string;
  uploadedById: string;
}

export async function uploadMembershipsCsv(input: UploadMembershipsCsvInput) {
  const job = await db.csvImportJob.create({
    data: { jobType: CsvJobType.MEMBERSHIPS, status: CsvImportStatus.VALIDATING, uploadedById: input.uploadedById },
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

  const headerOk = MEMBERSHIP_IMPORT_COLUMNS.every((col) => Object.keys(data[0]).includes(col));
  if (!headerOk) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: {
        status: CsvImportStatus.VALIDATION_FAILED,
        errorSummary: `ヘッダーが不正です。必要な列: ${MEMBERSHIP_IMPORT_COLUMNS.join(", ")}`,
      },
    });
    return job.id;
  }

  const stores = await db.store.findMany();
  const storeByCode = new Map(stores.map((s) => [s.code, s]));
  const users = await db.user.findMany({ select: { id: true, loginName: true } });
  const userByLoginName = new Map(users.map((u) => [u.loginName, u]));

  let anyInvalid = false;

  for (let i = 0; i < data.length; i++) {
    const raw = data[i] as unknown as MembershipImportRowData;
    const rowErrors: string[] = [];

    if (!raw.login_name?.trim()) rowErrors.push("login_nameが空です。");
    else if (!userByLoginName.has(raw.login_name.trim())) rowErrors.push(`ユーザー「${raw.login_name}」が存在しません。`);

    if (raw.operation?.trim().toUpperCase() !== "UPSERT") rowErrors.push("operationはUPSERTです。");
    if (!raw.store_code?.trim()) rowErrors.push("store_codeが空です。");
    else if (!storeByCode.has(raw.store_code.trim())) rowErrors.push(`店舗コード「${raw.store_code}」が存在しません。`);

    if (!raw.valid_from?.trim() || isNaN(Date.parse(raw.valid_from.trim()))) {
      rowErrors.push("valid_fromが不正です（YYYY-MM-DD形式）。");
    }

    if (raw.valid_to?.trim() && isNaN(Date.parse(raw.valid_to.trim()))) {
      rowErrors.push("valid_toが不正です（空欄またはYYYY-MM-DD形式）。");
    }

    if (!raw.membership_type?.trim() || !["PRIMARY", "TEMPORARY"].includes(raw.membership_type.trim())) {
      rowErrors.push("membership_typeは PRIMARY または TEMPORARY を指定してください。");
    }

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

export interface ApplyMembershipsCsvInput {
  jobId: string;
  actorUserId: string;
  ctx: RequestContext;
}

export async function applyMembershipsCsv(input: ApplyMembershipsCsvInput): Promise<number> {
  const job = await db.csvImportJob.findUniqueOrThrow({ where: { id: input.jobId }, include: { rows: true } });

  if (job.status !== CsvImportStatus.PREVIEW_READY) throw new Error("このジョブは確定可能な状態ではありません。");
  if (job.rows.some((r) => r.status === CsvRowStatus.INVALID)) throw new Error("無効な行が含まれています。");

  const stores = await db.store.findMany();
  const storeByCode = new Map(stores.map((s) => [s.code, s]));
  const users = await db.user.findMany({ select: { id: true, loginName: true } });
  const userByLoginName = new Map(users.map((u) => [u.loginName, u]));

  let count = 0;

  await db.$transaction(async (tx) => {
    for (const row of job.rows) {
      const raw = csvRowData<MembershipImportRowData>(row.rawData);
      const store = storeByCode.get(raw.store_code.trim())!;
      const user = userByLoginName.get(raw.login_name.trim())!;

      const validFrom = new Date(raw.valid_from.trim());
      const existing = await tx.castStoreMembership.findFirst({
        where: {
          userId: user.id,
          storeId: store.id,
          validFrom,
          membershipType: raw.membership_type.trim() as MembershipType,
        },
      });
      const data = {
          userId: user.id,
          storeId: store.id,
          validFrom,
          validTo: raw.valid_to?.trim() ? new Date(raw.valid_to.trim()) : null,
          membershipType: raw.membership_type.trim() as MembershipType,
          createdById: input.actorUserId,
      };
      if (existing) {
        await tx.castStoreMembership.update({ where: { id: existing.id }, data: { validTo: data.validTo } });
      } else {
        await tx.castStoreMembership.create({ data });
      }
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
