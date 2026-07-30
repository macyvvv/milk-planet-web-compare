import "server-only";
import { db } from "@/lib/db";
import { Role, TokenPurpose, UserStatus, type Prisma } from "@/app/generated/prisma/client";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";
import { revokeAllSessionsForUser } from "@/lib/modules/auth/session";
import { issueSetupToken } from "@/lib/modules/auth/setup-tokens.service";
import {
  normalizeRegistrationStoreScopes,
  type RegistrationRole,
} from "./registration-policy";

interface AdminContext {
  actorUserId: string;
  ctx: RequestContext;
}

/**
 * REQ-AUTH-004: ログイン処理は有効ユーザーのみを検索する。
 * REQ-AUTH-003 / D-004: 一意性は PENDING_SETUP と ACTIVE の間でのみ判定するため、ログイン検索
 * 自体はステータスを問わず引いた上で呼び出し側がステータスを見て弾く(ロックアウト理由を
 * 「アカウントが存在しない」と区別せず一律の失敗として扱うため)。
 */
export async function findUserByLoginName(loginName: string) {
  return db.user.findFirst({
    where: { loginName, status: { in: [UserStatus.PENDING_SETUP, UserStatus.ACTIVE] } },
    include: { credential: true },
  });
}

export interface RegisterCastInput {
  loginName: string;
  displayName: string;
  displayNameKana: string;
  storeId: string;
  role: RegistrationRole;
  managedStoreIds: string[];
  actorUserId: string;
  ctx: RequestContext;
}

/**
 * REQ-AUTH-005: 管理者事前登録。ロール、PRIMARY所属、管理店舗までを1トランザクションで行う。
 * パスワードはこの時点では存在しない(status=PENDING_SETUP、初期設定コード入力後に本人が設定)。
 * 呼び出し側(Server Action)が事前に requireRole(...) で権限検証済みであることを前提とする。
 */
export async function registerCast(input: RegisterCastInput) {
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const managedStoreIds = normalizeRegistrationStoreScopes(
      input.role,
      input.storeId,
      input.managedStoreIds,
    );
    const existingStoreCount = await tx.store.count({
      where: { id: { in: [input.storeId, ...managedStoreIds] }, status: "ACTIVE" },
    });
    if (existingStoreCount !== new Set([input.storeId, ...managedStoreIds]).size) {
      throw new Error("指定された有効店舗が存在しません。");
    }

    const user = await tx.user.create({
      data: {
        loginName: input.loginName,
        displayName: input.displayName,
        displayNameKana: input.displayNameKana,
        status: UserStatus.PENDING_SETUP,
      },
    });

    await tx.userCredential.create({ data: { userId: user.id } });

    await tx.userRole.create({
      data: { userId: user.id, role: input.role as Role, grantedById: input.actorUserId },
    });

    await tx.castStoreMembership.create({
      data: {
        userId: user.id,
        storeId: input.storeId,
        validFrom: new Date(),
        membershipType: "PRIMARY",
        createdById: input.actorUserId,
      },
    });

    if (managedStoreIds.length) {
      await tx.managerStoreScope.createMany({
        data: managedStoreIds.map((storeId) => ({
          userId: user.id,
          storeId,
          grantedById: input.actorUserId,
        })),
      });
    }

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.USER_REGISTERED,
        entityType: "User",
        entityId: user.id,
        storeId: input.storeId,
        afterData: {
          loginName: input.loginName,
          displayName: input.displayName,
          role: input.role,
          managedStoreIds,
        },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    const setupCode = await issueSetupToken(
      {
        userId: user.id,
        purpose: TokenPurpose.INITIAL_SETUP,
        issuedById: input.actorUserId,
        ctx: input.ctx,
      },
      tx,
    );

    return { user, setupCode };
  });
}

export interface DeactivateUserInput {
  userId: string;
  actorUserId: string;
  reason: string;
  ctx: RequestContext;
}

/** REQ-MEMBER-004: 退店者は物理削除せず INACTIVE 化する。 */
export async function deactivateUser(input: DeactivateUserInput) {
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const before = await tx.user.findUniqueOrThrow({ where: { id: input.userId } });
    if (before.status === UserStatus.INACTIVE) return before;

    const superUserRole = await tx.userRole.findFirst({
      where: { userId: input.userId, role: "SUPER_USER", revokedAt: null },
    });
    if (superUserRole) {
      const activeSuperUsers = await tx.user.count({
        where: {
          status: UserStatus.ACTIVE,
          rolesGranted: { some: { role: "SUPER_USER", revokedAt: null } },
        },
      });
      if (activeSuperUsers <= 1) {
        throw new Error("最後の有効なSUPER_USERは無効化できません。");
      }
    }

    const after = await tx.user.update({
      where: { id: input.userId },
      data: { status: UserStatus.INACTIVE },
    });
    await revokeAllSessionsForUser(input.userId, tx);

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.USER_DEACTIVATED,
        entityType: "User",
        entityId: input.userId,
        beforeData: { status: before.status },
        afterData: { status: after.status },
        reason: input.reason,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return after;
  });
}

export async function updateResignationDate(
  userId: string,
  resignationScheduledOn: Date | null,
  admin: AdminContext
) {
  await db.$transaction(async (tx) => {
    const before = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (before.resignationScheduledOn?.getTime() === resignationScheduledOn?.getTime()) return;

    await tx.user.update({
      where: { id: userId },
      data: { resignationScheduledOn },
    });

    await recordAuditLog(
      {
        actorUserId: admin.actorUserId,
        action: "USER_RESIGNATION_DATE_UPDATED",
        entityType: "User",
        entityId: userId,
        beforeData: { resignationScheduledOn: before.resignationScheduledOn },
        afterData: { resignationScheduledOn },
        ipAddress: admin.ctx.ipAddress,
        userAgent: admin.ctx.userAgent,
      },
      tx
    );
  });
}

export async function updateMemberships(
  userId: string,
  storeIds: string[],
  admin: AdminContext
) {
  await db.$transaction(async (tx) => {
    const uniqueStoreIds = [...new Set(storeIds)];
    const active = await tx.castStoreMembership.findMany({
      where: { userId, validTo: null },
    });
    const activeIds = new Set(active.map((m) => m.storeId));

    // End memberships not in the new list
    await tx.castStoreMembership.updateMany({
      where: { userId, validTo: null, storeId: { notIn: uniqueStoreIds } },
      data: { validTo: new Date() },
    });

    // Add new memberships
    for (const storeId of uniqueStoreIds) {
      if (!activeIds.has(storeId)) {
        await tx.castStoreMembership.create({
          data: {
            userId,
            storeId,
            validFrom: new Date(),
            membershipType: "PRIMARY",
            createdById: admin.actorUserId,
          },
        });
      }
    }

    await recordAuditLog(
      {
        actorUserId: admin.actorUserId,
        action: "USER_MEMBERSHIPS_UPDATED",
        entityType: "CastStoreMembership",
        entityId: userId,
        beforeData: { storeIds: [...activeIds] },
        afterData: { storeIds: uniqueStoreIds },
        ipAddress: admin.ctx.ipAddress,
        userAgent: admin.ctx.userAgent,
      },
      tx
    );
  });
}
