import "server-only";
import { db } from "@/lib/db";
import { Role, UserStatus, type Prisma } from "@/app/generated/prisma/client";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import { revokeAllSessionsForUser, type RequestContext } from "@/lib/modules/auth/session";
import { DomainError } from "@/lib/errors/domain-error";

interface AdminContext {
  actorUserId: string;
  ctx: RequestContext;
}

async function assertNotLastSuperUser(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  const target = await tx.user.findFirst({
    where: {
      id: userId,
      status: UserStatus.ACTIVE,
      rolesGranted: { some: { role: Role.SUPER_USER, revokedAt: null } },
    },
  });
  if (!target) return;

  const count = await tx.user.count({
    where: {
      status: UserStatus.ACTIVE,
      rolesGranted: { some: { role: Role.SUPER_USER, revokedAt: null } },
    },
  });
  if (count <= 1) {
    throw new DomainError("最後の有効なスーパーユーザーは変更できません。", "LAST_SUPER_USER");
  }
}

export async function unlockAccount(userId: string, admin: AdminContext) {
  await db.$transaction(async (tx) => {
    await tx.userCredential.update({
      where: { userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
    await recordAuditLog(
      {
        actorUserId: admin.actorUserId,
        action: AUDIT_ACTIONS.ACCOUNT_UNLOCKED,
        entityType: "User",
        entityId: userId,
        ipAddress: admin.ctx.ipAddress,
        userAgent: admin.ctx.userAgent,
      },
      tx,
    );
  });
}

export async function grantRole(userId: string, role: Role, admin: AdminContext) {
  await db.$transaction(async (tx) => {
    const existing = await tx.userRole.findFirst({
      where: { userId, role, revokedAt: null },
    });
    if (existing) return;
    await tx.userRole.create({
      data: { userId, role, grantedById: admin.actorUserId },
    });
    await recordAuditLog(
      {
        actorUserId: admin.actorUserId,
        action: AUDIT_ACTIONS.ROLE_GRANTED,
        entityType: "UserRole",
        entityId: userId,
        afterData: { role },
        ipAddress: admin.ctx.ipAddress,
        userAgent: admin.ctx.userAgent,
      },
      tx,
    );
  });
}

export async function revokeRole(userId: string, role: Role, admin: AdminContext) {
  await db.$transaction(async (tx) => {
    if (role === Role.SUPER_USER) await assertNotLastSuperUser(tx, userId);
    const result = await tx.userRole.updateMany({
      where: { userId, role, revokedAt: null },
      data: { revokedAt: new Date(), revokedById: admin.actorUserId },
    });
    if (result.count === 0) return;
    await recordAuditLog(
      {
        actorUserId: admin.actorUserId,
        action: AUDIT_ACTIONS.ROLE_REVOKED,
        entityType: "UserRole",
        entityId: userId,
        beforeData: { role },
        ipAddress: admin.ctx.ipAddress,
        userAgent: admin.ctx.userAgent,
      },
      tx,
    );
  });
}

export async function replaceManagerScopes(
  userId: string,
  storeIds: string[],
  admin: AdminContext,
) {
  await db.$transaction(async (tx) => {
    const uniqueStoreIds = [...new Set(storeIds)];
    const active = await tx.managerStoreScope.findMany({
      where: { userId, revokedAt: null },
    });
    const activeIds = new Set(active.map((scope) => scope.storeId));

    await tx.managerStoreScope.updateMany({
      where: { userId, revokedAt: null, storeId: { notIn: uniqueStoreIds } },
      data: { revokedAt: new Date() },
    });
    for (const storeId of uniqueStoreIds) {
      if (!activeIds.has(storeId)) {
        await tx.managerStoreScope.create({
          data: { userId, storeId, grantedById: admin.actorUserId },
        });
      }
    }
    await recordAuditLog(
      {
        actorUserId: admin.actorUserId,
        action: AUDIT_ACTIONS.MANAGER_SCOPE_GRANTED,
        entityType: "ManagerStoreScope",
        entityId: userId,
        beforeData: { storeIds: [...activeIds] },
        afterData: { storeIds: uniqueStoreIds },
        ipAddress: admin.ctx.ipAddress,
        userAgent: admin.ctx.userAgent,
      },
      tx,
    );
  });
}

export async function deactivateAccount(userId: string, reason: string, admin: AdminContext) {
  await db.$transaction(async (tx) => {
    await assertNotLastSuperUser(tx, userId);
    const before = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (before.status === UserStatus.INACTIVE) return;
    await tx.user.update({ where: { id: userId }, data: { status: UserStatus.INACTIVE } });
    await revokeAllSessionsForUser(userId, tx);
    await recordAuditLog(
      {
        actorUserId: admin.actorUserId,
        action: AUDIT_ACTIONS.USER_DEACTIVATED,
        entityType: "User",
        entityId: userId,
        beforeData: { status: before.status },
        afterData: { status: UserStatus.INACTIVE },
        reason,
        ipAddress: admin.ctx.ipAddress,
        userAgent: admin.ctx.userAgent,
      },
      tx,
    );
  });
}
