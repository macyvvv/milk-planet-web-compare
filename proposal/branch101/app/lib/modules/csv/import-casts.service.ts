import "server-only";
import { db } from "@/lib/db";
import {
  UserStatus,
  CsvJobType,
  CsvImportStatus,
  CsvRowStatus,
  TokenPurpose,
} from "@/app/generated/prisma/client";
import { parseCsvText } from "./csv-utils";
import { issueSetupToken } from "@/lib/modules/auth/setup-tokens.service";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

// REQ-CSV-002,003: キャスト一括登録CSVのスキーマ。
export const CAST_IMPORT_COLUMNS = ["login_name", "display_name", "display_name_kana", "store_name"] as const;

interface CastImportRowData {
  login_name: string;
  display_name: string;
  display_name_kana: string;
  store_name: string;
}

export interface UploadCastsCsvInput {
  csvText: string;
  uploadedById: string;
}

/** REQ-CSV-003 手順1-7: 形式・ヘッダー・行単位・参照整合性・重複を検証し、プレビュー用に保存する。 */
export async function uploadCastsCsv(input: UploadCastsCsvInput) {
  const job = await db.csvImportJob.create({
    data: { jobType: CsvJobType.CASTS, status: CsvImportStatus.VALIDATING, uploadedById: input.uploadedById },
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

  const headerOk = CAST_IMPORT_COLUMNS.every((col) => Object.keys(data[0]).includes(col));
  if (!headerOk) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: {
        status: CsvImportStatus.VALIDATION_FAILED,
        errorSummary: `ヘッダーが不正です。必要な列: ${CAST_IMPORT_COLUMNS.join(", ")}`,
      },
    });
    return job.id;
  }

  const stores = await db.store.findMany();
  const storeByName = new Map(stores.map((s) => [s.name, s]));
  const existingActiveLoginNames = new Set(
    (
      await db.user.findMany({
        where: { status: { in: [UserStatus.PENDING_SETUP, UserStatus.ACTIVE] } },
        select: { loginName: true },
      })
    ).map((u) => u.loginName),
  );

  const seenInFile = new Set<string>();
  let anyInvalid = false;

  for (let i = 0; i < data.length; i++) {
    const raw = data[i] as unknown as CastImportRowData;
    const rowErrors: string[] = [];

    if (!raw.login_name?.trim()) rowErrors.push("login_nameが空です。");
    if (!raw.display_name?.trim()) rowErrors.push("display_nameが空です。");
    if (!raw.display_name_kana?.trim()) rowErrors.push("display_name_kanaが空です。");
    if (!raw.store_name?.trim()) rowErrors.push("store_nameが空です。");
    else if (!storeByName.has(raw.store_name.trim())) rowErrors.push(`店舗「${raw.store_name}」が存在しません。`);

    if (raw.login_name?.trim()) {
      if (existingActiveLoginNames.has(raw.login_name.trim())) {
        rowErrors.push("このキャスト名は既に使用されています。");
      }
      if (seenInFile.has(raw.login_name.trim())) {
        rowErrors.push("CSV内でキャスト名が重複しています。");
      }
      seenInFile.add(raw.login_name.trim());
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

export async function getImportPreview(jobId: string) {
  const job = await db.csvImportJob.findUniqueOrThrow({ where: { id: jobId }, include: { rows: true } });
  return job;
}

export interface ApplyCastsCsvInput {
  jobId: string;
  actorUserId: string;
  ctx: RequestContext;
}

export interface ApplyCastsCsvResult {
  displayName: string;
  loginName: string;
  setupCode: string;
}

/**
 * REQ-CSV-003 手順8-10: 管理者確定後、単一トランザクションで反映する。
 * 1行でも無効な行があれば適用しない(部分成功を避ける)。
 */
export async function applyCastsCsv(input: ApplyCastsCsvInput): Promise<ApplyCastsCsvResult[]> {
  const job = await db.csvImportJob.findUniqueOrThrow({ where: { id: input.jobId }, include: { rows: true } });

  if (job.status !== CsvImportStatus.PREVIEW_READY) {
    throw new Error("このジョブは確定可能な状態ではありません。");
  }
  if (job.rows.some((r) => r.status === CsvRowStatus.INVALID)) {
    throw new Error("無効な行が含まれています。全行が有効な状態でのみ反映できます。");
  }

  const stores = await db.store.findMany();
  const storeByName = new Map(stores.map((s) => [s.name, s]));
  const results: ApplyCastsCsvResult[] = [];

  await db.$transaction(async (tx) => {
    for (const row of job.rows) {
      const raw = row.rawData as unknown as CastImportRowData;
      const store = storeByName.get(raw.store_name.trim())!;

      const user = await tx.user.create({
        data: {
          loginName: raw.login_name.trim(),
          displayName: raw.display_name.trim(),
          displayNameKana: raw.display_name_kana.trim(),
          status: UserStatus.PENDING_SETUP,
        },
      });
      await tx.userCredential.create({ data: { userId: user.id } });
      await tx.userRole.create({ data: { userId: user.id, role: "CAST", grantedById: input.actorUserId } });
      await tx.castStoreMembership.create({
        data: {
          userId: user.id,
          storeId: store.id,
          validFrom: new Date(),
          membershipType: "PRIMARY",
          createdById: input.actorUserId,
        },
      });

      const setupCode = await issueSetupToken({
        userId: user.id,
        purpose: TokenPurpose.INITIAL_SETUP,
        issuedById: input.actorUserId,
        ctx: input.ctx,
      });

      results.push({ displayName: user.displayName, loginName: user.loginName, setupCode });
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
        afterData: { rowCount: job.rows.length },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );
  });

  return results;
}
