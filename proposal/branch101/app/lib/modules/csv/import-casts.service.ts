import "server-only";
import { db } from "@/lib/db";
import {
  Role,
  UserStatus,
  CsvJobType,
  CsvImportStatus,
  CsvRowStatus,
} from "@/app/generated/prisma/client";
import { csvRowData, parseCsvText } from "./csv-utils";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";
import { hashPassword } from "@/lib/modules/auth/password";
import { randomInt } from "node:crypto";
import { DomainError } from "@/lib/errors/domain-error";

export const CAST_IMPORT_COLUMNS = [
  "operation",
  "login_name",
  "display_name",
  "display_name_kana",
  "store_name",
  "pin",
  "permission_level",
  "job_title",
] as const;

interface CastImportRowData {
  operation: string;
  login_name: string;
  display_name: string;
  display_name_kana: string;
  store_name: string;
  pin: string;
  permission_level: string;
  job_title: string;
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
  const seenInFile = new Set<string>();
  let anyInvalid = false;

  for (let i = 0; i < data.length; i++) {
    const raw = data[i] as unknown as CastImportRowData;
    const rowErrors: string[] = [];

    if (raw.operation?.trim().toUpperCase() !== "UPSERT") rowErrors.push("operationはUPSERTを指定してください。");
    if (!raw.login_name?.trim()) rowErrors.push("login_nameが空です。");
    if (!raw.display_name?.trim()) rowErrors.push("display_nameが空です。");
    if (!raw.display_name_kana?.trim()) rowErrors.push("display_name_kanaが空です。");
    if (!raw.store_name?.trim()) rowErrors.push("store_nameが空です。");
    else if (!storeByName.has(raw.store_name.trim())) rowErrors.push(`店舗「${raw.store_name}」が存在しません。`);

    if (raw.pin?.trim() && !/^\d{4}$/.test(raw.pin.trim())) rowErrors.push("pinは数字4桁または空欄です。");
    const permission = raw.permission_level?.trim() || "GENERAL_USER";
    const title = raw.job_title?.trim() || "CAST";
    if (!["GENERAL_USER", "STORE_ADMIN", "AREA_MANAGER", "SUPER_USER"].includes(permission)) {
      rowErrors.push("permission_levelが不正です。");
    }
    if (!["CAST", "STORE_MANAGER", "STORE_DEPUTY_MANAGER", "AREA_MANAGER", "SUPER_USER"].includes(title)) {
      rowErrors.push("job_titleが不正です。");
    }
    const validPair =
      (permission === "GENERAL_USER" && title === "CAST") ||
      (permission === "STORE_ADMIN" && ["STORE_MANAGER", "STORE_DEPUTY_MANAGER"].includes(title)) ||
      (permission === "AREA_MANAGER" && title === "AREA_MANAGER") ||
      (permission === "SUPER_USER" && title === "SUPER_USER");
    if (!validPair) rowErrors.push("permission_levelとjob_titleの組み合わせが不正です。");

    if (raw.login_name?.trim()) {
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
  pin: string;
  generated: boolean;
  operation: "CREATED" | "UPDATED";
}

async function prepareCredentials(rows: { rawData: string }[]) {
  const prepared: {
    row: { rawData: string };
    raw: CastImportRowData;
    pin: string;
    passwordHash: string;
    generated: boolean;
  }[] = new Array(rows.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < rows.length) {
      const index = nextIndex++;
      const row = rows[index];
      const raw = csvRowData<CastImportRowData>(row.rawData);
      const pin = raw.pin?.trim() || randomInt(10_000).toString().padStart(4, "0");
      prepared[index] = {
        row,
        raw,
        pin,
        passwordHash: await hashPassword(pin),
        generated: !raw.pin?.trim(),
      };
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, rows.length) }, worker));
  return prepared;
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
  const prepared = await prepareCredentials(job.rows);

  await db.$transaction(async (tx) => {
    for (const item of prepared) {
      const { raw, pin, passwordHash, generated } = item;
      const store = storeByName.get(raw.store_name.trim())!;
      const existing = await tx.user.findFirst({ where: { loginName: raw.login_name.trim() } });
      const nextRole = (raw.job_title?.trim() || "CAST") as Role;
      if (existing && nextRole !== Role.SUPER_USER) {
        const targetIsSuperUser = await tx.userRole.findFirst({
          where: { userId: existing.id, role: Role.SUPER_USER, revokedAt: null },
        });
        if (targetIsSuperUser) {
          const activeSuperUsers = await tx.user.count({
            where: {
              status: UserStatus.ACTIVE,
              rolesGranted: { some: { role: Role.SUPER_USER, revokedAt: null } },
            },
          });
          if (activeSuperUsers <= 1) {
            throw new DomainError(
              "最後の有効なスーパーユーザーはCSVで降格できません。",
              "LAST_SUPER_USER",
            );
          }
        }
      }
      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: {
              displayName: raw.display_name.trim(),
              displayNameKana: raw.display_name_kana.trim(),
              status: UserStatus.ACTIVE,
            },
          })
        : await tx.user.create({ data: {
          loginName: raw.login_name.trim(),
          displayName: raw.display_name.trim(),
          displayNameKana: raw.display_name_kana.trim(),
          status: UserStatus.ACTIVE,
        } });
      await tx.userCredential.upsert({
        where: { userId: user.id },
        create: { userId: user.id, passwordHash, passwordUpdatedAt: new Date() },
        update: { passwordHash, passwordUpdatedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null },
      });
      await tx.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.userRole.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date(), revokedById: input.actorUserId },
      });
      await tx.userRole.create({ data: { userId: user.id, role: nextRole, grantedById: input.actorUserId } });
      await tx.managerStoreScope.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (nextRole === Role.STORE_MANAGER || nextRole === Role.STORE_DEPUTY_MANAGER) {
        await tx.managerStoreScope.create({
          data: { userId: user.id, storeId: store.id, grantedById: input.actorUserId },
        });
      }
      const currentMembership = await tx.castStoreMembership.findFirst({
        where: { userId: user.id, validTo: null, membershipType: "PRIMARY" },
      });
      if (!currentMembership || currentMembership.storeId !== store.id) {
        await tx.castStoreMembership.updateMany({
          where: { userId: user.id, validTo: null, membershipType: "PRIMARY" },
          data: { validTo: new Date() },
        });
        await tx.castStoreMembership.create({
          data: {
            userId: user.id,
            storeId: store.id,
            validFrom: new Date(),
            membershipType: "PRIMARY",
            createdById: input.actorUserId,
          },
        });
      }
      results.push({
        displayName: user.displayName,
        loginName: user.loginName,
        pin,
        generated,
        operation: existing ? "UPDATED" : "CREATED",
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
        afterData: { rowCount: job.rows.length },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );
  });

  return results;
}
