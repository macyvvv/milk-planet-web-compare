import "server-only";
import { randomInt } from "node:crypto";
import {
  CsvImportStatus,
  CsvJobType,
  CsvRowStatus,
  Role,
  UserStatus,
} from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors/domain-error";
import { hashPassword } from "@/lib/modules/auth/password";
import type { RequestContext } from "@/lib/modules/auth/session";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { csvRowData, parseCsvText } from "./csv-utils";

export const CAST_IMPORT_COLUMNS = [
  "operation",
  "user_id",
  "login_name",
  "display_name",
  "display_name_kana",
  "store_code",
  "pin",
  "permission_level",
  "job_title",
  "managed_store_codes",
  "resignation_scheduled_on",
] as const;

type AccountOperation = "UPSERT" | "RESET_PIN" | "DEACTIVATE" | "REACTIVATE";

interface CastImportRowData {
  operation: string;
  user_id: string;
  login_name: string;
  display_name: string;
  display_name_kana: string;
  store_code: string;
  pin: string;
  permission_level: string;
  job_title: string;
  managed_store_codes: string;
  resignation_scheduled_on: string;
}

const PERMISSIONS = ["GENERAL_USER", "STORE_ADMIN", "AREA_MANAGER", "SUPER_USER"];
const TITLES = ["CAST", "STORE_MANAGER", "STORE_DEPUTY_MANAGER", "AREA_MANAGER", "SUPER_USER"];

function validPermissionPair(permission: string, title: string) {
  return (
    (permission === "GENERAL_USER" && title === "CAST") ||
    (permission === "STORE_ADMIN" && ["STORE_MANAGER", "STORE_DEPUTY_MANAGER"].includes(title)) ||
    (permission === "AREA_MANAGER" && title === "AREA_MANAGER") ||
    (permission === "SUPER_USER" && title === "SUPER_USER")
  );
}

export async function uploadCastsCsv(input: { csvText: string; uploadedById: string }) {
  const job = await db.csvImportJob.create({
    data: {
      jobType: CsvJobType.CASTS,
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
  if (!CAST_IMPORT_COLUMNS.every((column) => Object.hasOwn(parsed.data[0], column))) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: {
        status: CsvImportStatus.VALIDATION_FAILED,
        errorSummary: `ヘッダーが不正です。必要な列: ${CAST_IMPORT_COLUMNS.join(", ")}`,
      },
    });
    return job.id;
  }

  const [stores, users] = await Promise.all([
    db.store.findMany({ select: { code: true } }),
    db.user.findMany({ select: { id: true, loginName: true } }),
  ]);
  const storeCodes = new Set(stores.map((store) => store.code));
  const usersById = new Map(users.map((user) => [user.id, user]));
  const usersByLogin = new Map<string, typeof users>();
  for (const user of users) {
    usersByLogin.set(user.loginName, [...(usersByLogin.get(user.loginName) ?? []), user]);
  }
  const seenTargets = new Set<string>();
  let anyInvalid = false;

  for (const [index, value] of parsed.data.entries()) {
    const raw = value as unknown as CastImportRowData;
    const errors: string[] = [];
    const operation = raw.operation.trim().toUpperCase() as AccountOperation;
    if (!["UPSERT", "RESET_PIN", "DEACTIVATE", "REACTIVATE"].includes(operation)) {
      errors.push("operationが不正です。");
    }
    const loginName = raw.login_name.trim();
    const userId = raw.user_id.trim();
    const byLogin = loginName ? usersByLogin.get(loginName) ?? [] : [];
    if (byLogin.length > 1 && !userId) errors.push("同じlogin_nameの履歴が複数あります。user_idを指定してください。");
    const existing = userId ? usersById.get(userId) : byLogin[0];
    if (userId && !existing) errors.push("user_idが存在しません。");
    if (operation !== "UPSERT" && !existing) errors.push(`${operation}は既存ユーザーのみ指定できます。`);
    if (operation === "UPSERT" && !existing) {
      if (!loginName) errors.push("新規登録ではlogin_nameが必須です。");
      if (!raw.display_name.trim()) errors.push("新規登録ではdisplay_nameが必須です。");
      if (!raw.display_name_kana.trim()) errors.push("新規登録ではdisplay_name_kanaが必須です。");
      if (!raw.store_code.trim()) errors.push("新規登録ではstore_codeが必須です。");
    }
    const targetKey = existing?.id ?? loginName;
    if (targetKey) {
      if (seenTargets.has(targetKey)) errors.push("CSV内で同じユーザーを複数回指定できません。");
      seenTargets.add(targetKey);
    }
    if (raw.store_code.trim() && !storeCodes.has(raw.store_code.trim())) {
      errors.push("store_codeが存在しません。");
    }
    const managedCodes = raw.managed_store_codes
      .split("|")
      .map((code) => code.trim())
      .filter(Boolean);
    for (const code of managedCodes) {
      if (!storeCodes.has(code)) errors.push(`管理対象店舗コード「${code}」が存在しません。`);
    }
    if (raw.pin.trim() && !/^\d{4}$/.test(raw.pin.trim())) errors.push("pinは数字4桁または空欄です。");
    if (raw.permission_level.trim() || raw.job_title.trim()) {
      if (!PERMISSIONS.includes(raw.permission_level.trim())) errors.push("permission_levelが不正です。");
      if (!TITLES.includes(raw.job_title.trim())) errors.push("job_titleが不正です。");
      if (!validPermissionPair(raw.permission_level.trim(), raw.job_title.trim())) {
        errors.push("permission_levelとjob_titleの組み合わせが不正です。");
      }
    } else if (!existing && operation === "UPSERT") {
      // New users default to the general-user tier.
      raw.permission_level = "GENERAL_USER";
      raw.job_title = "CAST";
    }
    const resignation = raw.resignation_scheduled_on.trim();
    if (resignation && resignation !== "CLEAR" && Number.isNaN(new Date(resignation).getTime())) {
      errors.push("resignation_scheduled_onはYYYY-MM-DD、CLEAR、または空欄です。");
    }

    anyInvalid ||= errors.length > 0;
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
    data: { status: anyInvalid ? CsvImportStatus.VALIDATION_FAILED : CsvImportStatus.PREVIEW_READY },
  });
  return job.id;
}

export interface ApplyCastsCsvResult {
  displayName: string;
  loginName: string;
  pin?: string;
  generated: boolean;
  operation: "CREATED" | "UPDATED" | "PIN_RESET" | "DEACTIVATED" | "REACTIVATED";
}

async function prepareCredentials(
  rows: { rawData: string }[],
  existingIds: Set<string>,
  existingLoginNames: Set<string>,
) {
  const output = new Map<number, { pin: string; passwordHash: string; generated: boolean }>();
  let next = 0;
  const worker = async () => {
    while (next < rows.length) {
      const index = next++;
      const raw = csvRowData<CastImportRowData>(rows[index].rawData);
      const operation = raw.operation.trim().toUpperCase();
      const isExisting =
        Boolean(raw.user_id.trim() && existingIds.has(raw.user_id.trim())) ||
        Boolean(raw.login_name.trim() && existingLoginNames.has(raw.login_name.trim()));
      const needsCredential =
        operation === "RESET_PIN" ||
        (operation === "UPSERT" && (!isExisting || Boolean(raw.pin.trim())));
      if (!needsCredential) continue;
      const pin = raw.pin.trim() || randomInt(10_000).toString().padStart(4, "0");
      output.set(index, {
        pin,
        passwordHash: await hashPassword(pin),
        generated: !raw.pin.trim(),
      });
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, rows.length) }, worker));
  return output;
}

export async function applyCastsCsv(input: {
  jobId: string;
  actorUserId: string;
  ctx: RequestContext;
}): Promise<ApplyCastsCsvResult[]> {
  const job = await db.csvImportJob.findUniqueOrThrow({
    where: { id: input.jobId },
    include: { rows: { orderBy: { rowNo: "asc" } } },
  });
  if (job.status !== CsvImportStatus.PREVIEW_READY) throw new DomainError("確定可能な状態ではありません。", "CSV_STATE");
  if (job.rows.some((row) => row.status === CsvRowStatus.INVALID)) {
    throw new DomainError("無効な行が含まれています。", "CSV_INVALID");
  }

  const [stores, users] = await Promise.all([
    db.store.findMany(),
    db.user.findMany({
      include: { rolesGranted: { where: { revokedAt: null } } },
    }),
  ]);
  const storesByCode = new Map(stores.map((store) => [store.code, store]));
  const usersById = new Map(users.map((user) => [user.id, user]));
  const usersByLogin = new Map(users.map((user) => [user.loginName, user]));
  const existingIds = new Set(users.map((user) => user.id));
  const existingLoginNames = new Set(users.map((user) => user.loginName));
  const credentials = await prepareCredentials(job.rows, existingIds, existingLoginNames);

  const finalSuperUsers = new Set(
    users
      .filter(
        (user) =>
          user.status === UserStatus.ACTIVE &&
          user.rolesGranted.some((grant) => grant.role === Role.SUPER_USER),
      )
      .map((user) => user.id),
  );
  for (const row of job.rows) {
    const raw = csvRowData<CastImportRowData>(row.rawData);
    const operation = raw.operation.trim().toUpperCase();
    const existing = usersById.get(raw.user_id.trim()) ?? usersByLogin.get(raw.login_name.trim());
    const key = existing?.id ?? `new:${raw.login_name.trim()}`;
    if (operation === "DEACTIVATE") finalSuperUsers.delete(key);
    if (operation === "REACTIVATE" && existing?.rolesGranted.some((grant) => grant.role === Role.SUPER_USER)) {
      finalSuperUsers.add(key);
    }
    if (operation === "UPSERT" && raw.job_title.trim()) {
      if (
        raw.job_title.trim() === Role.SUPER_USER &&
        (!existing || existing.status === UserStatus.ACTIVE)
      ) {
        finalSuperUsers.add(key);
      }
      else finalSuperUsers.delete(key);
    }
  }
  if (!finalSuperUsers.size) {
    throw new DomainError("CSV適用後に有効なスーパーユーザーが0人になります。", "LAST_SUPER_USER");
  }

  const results: ApplyCastsCsvResult[] = [];
  await db.$transaction(async (tx) => {
    for (const [index, row] of job.rows.entries()) {
      const raw = csvRowData<CastImportRowData>(row.rawData);
      const operation = raw.operation.trim().toUpperCase() as AccountOperation;
      const existing = usersById.get(raw.user_id.trim()) ?? usersByLogin.get(raw.login_name.trim());
      if (operation === "DEACTIVATE" || operation === "REACTIVATE") {
        const user = await tx.user.update({
          where: { id: existing!.id },
          data: { status: operation === "DEACTIVATE" ? UserStatus.INACTIVE : UserStatus.ACTIVE },
        });
        if (operation === "DEACTIVATE") {
          await tx.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
        }
        results.push({
          displayName: user.displayName,
          loginName: user.loginName,
          generated: false,
          operation: operation === "DEACTIVATE" ? "DEACTIVATED" : "REACTIVATED",
        });
        continue;
      }

      let user = existing;
      if (!user) {
        user = await tx.user.create({
          data: {
            loginName: raw.login_name.trim(),
            displayName: raw.display_name.trim(),
            displayNameKana: raw.display_name_kana.trim(),
            status: UserStatus.ACTIVE,
            resignationScheduledOn: raw.resignation_scheduled_on.trim()
              ? new Date(raw.resignation_scheduled_on.trim())
              : null,
          },
          include: { rolesGranted: true },
        });
      } else if (operation === "UPSERT") {
        const resignation = raw.resignation_scheduled_on.trim();
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            ...(raw.login_name.trim() ? { loginName: raw.login_name.trim() } : {}),
            ...(raw.display_name.trim() ? { displayName: raw.display_name.trim() } : {}),
            ...(raw.display_name_kana.trim() ? { displayNameKana: raw.display_name_kana.trim() } : {}),
            ...(resignation
              ? { resignationScheduledOn: resignation === "CLEAR" ? null : new Date(resignation) }
              : {}),
            version: { increment: 1 },
          },
          include: { rolesGranted: { where: { revokedAt: null } } },
        });
      }

      const credential = credentials.get(index);
      if (credential) {
        await tx.userCredential.upsert({
          where: { userId: user.id },
          create: { userId: user.id, passwordHash: credential.passwordHash, passwordUpdatedAt: new Date() },
          update: {
            passwordHash: credential.passwordHash,
            passwordUpdatedAt: new Date(),
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });
        await tx.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
      }

      if (operation === "UPSERT" && raw.job_title.trim()) {
        await tx.userRole.updateMany({
          where: { userId: user.id, revokedAt: null },
          data: { revokedAt: new Date(), revokedById: input.actorUserId },
        });
        await tx.userRole.create({
          data: { userId: user.id, role: raw.job_title.trim() as Role, grantedById: input.actorUserId },
        });
      }

      if (operation === "UPSERT" && raw.managed_store_codes.trim()) {
        await tx.managerStoreScope.updateMany({
          where: { userId: user.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        for (const code of raw.managed_store_codes.split("|").map((value) => value.trim()).filter(Boolean)) {
          await tx.managerStoreScope.create({
            data: { userId: user.id, storeId: storesByCode.get(code)!.id, grantedById: input.actorUserId },
          });
        }
      } else if (
        operation === "UPSERT" &&
        !existing &&
        ["STORE_MANAGER", "STORE_DEPUTY_MANAGER"].includes(raw.job_title.trim()) &&
        raw.store_code.trim()
      ) {
        await tx.managerStoreScope.create({
          data: {
            userId: user.id,
            storeId: storesByCode.get(raw.store_code.trim())!.id,
            grantedById: input.actorUserId,
          },
        });
      }

      if (operation === "UPSERT" && raw.store_code.trim()) {
        const store = storesByCode.get(raw.store_code.trim())!;
        const current = await tx.castStoreMembership.findFirst({
          where: { userId: user.id, validTo: null, membershipType: "PRIMARY" },
        });
        if (!current || current.storeId !== store.id) {
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
      }
      results.push({
        displayName: user.displayName,
        loginName: user.loginName,
        pin: credential?.pin,
        generated: credential?.generated ?? false,
        operation: operation === "RESET_PIN" ? "PIN_RESET" : existing ? "UPDATED" : "CREATED",
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
        afterData: { rowCount: job.rows.length, mode: "PARTIAL_ACCOUNT_UPDATE" },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );
  });
  return results;
}
