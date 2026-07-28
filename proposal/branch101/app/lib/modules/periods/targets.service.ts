import "server-only";
import { db } from "@/lib/db";
import { TargetStatus } from "@/app/generated/prisma/client";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

function resignationReason(resignationScheduledOn: Date): string {
  return `退店予定日(${resignationScheduledOn.toISOString().slice(0, 10)})以降を含むピリオドのため自動除外`;
}

/**
 * REQ-TARGET-001,002: 店舗のPRIMARY所属キャストから対象者を生成する。退店予定者は自動除外する。
 * 冪等: 既存行のうち自動管理分(ACTIVE/EXCLUDED_RESIGNED)だけを最新の所属・退店予定に同期し、
 * 管理者による手動除外(EXCLUDED_LONG_ABSENCE/EXCLUDED_OTHER)は上書きしない(REQ-TARGET-003,004)。
 */
export async function generateCastTargets(periodId: string, storeId: string): Promise<void> {
  const period = await db.period.findUniqueOrThrow({ where: { id: periodId } });

  const memberships = await db.castStoreMembership.findMany({
    where: {
      storeId,
      membershipType: "PRIMARY",
      validFrom: { lte: period.endDate },
      OR: [{ validTo: null }, { validTo: { gte: period.startDate } }],
    },
    include: { user: true },
  });

  for (const membership of memberships) {
    const resignationOn = membership.user.resignationScheduledOn;
    const isResigning = Boolean(resignationOn && resignationOn <= period.endDate);
    const autoStatus = isResigning ? TargetStatus.EXCLUDED_RESIGNED : TargetStatus.ACTIVE;
    const autoReason = isResigning && resignationOn ? resignationReason(resignationOn) : null;

    const existing = await db.periodCastTarget.findUnique({
      where: { periodId_storeId_userId: { periodId, storeId, userId: membership.userId } },
    });

    if (!existing) {
      await db.periodCastTarget.create({
        data: {
          periodId,
          storeId,
          userId: membership.userId,
          targetStatus: autoStatus,
          exclusionReason: autoReason,
        },
      });
      continue;
    }

    const wasAutoManaged =
      existing.targetStatus === TargetStatus.ACTIVE ||
      existing.targetStatus === TargetStatus.EXCLUDED_RESIGNED;

    if (wasAutoManaged && existing.targetStatus !== autoStatus) {
      await db.periodCastTarget.update({
        where: { id: existing.id },
        data: { targetStatus: autoStatus, exclusionReason: autoReason },
      });
    }
  }
}

export async function listCastTargets(periodId: string, storeId: string) {
  return db.periodCastTarget.findMany({
    where: { periodId, storeId },
    include: { user: true },
    orderBy: [{ user: { displayNameKana: "asc" } }, { user: { displayName: "asc" } }, { user: { id: "asc" } }],
  });
}

export interface SetManualExclusionInput {
  periodId: string;
  storeId: string;
  userId: string;
  status: typeof TargetStatus.EXCLUDED_LONG_ABSENCE | typeof TargetStatus.EXCLUDED_OTHER;
  reason: string;
  actorUserId: string;
  ctx: RequestContext;
}

/** REQ-TARGET-003: 管理者による個別の提出対象外設定。理由必須、監査ログ必須。 */
export async function setManualExclusion(input: SetManualExclusionInput) {
  return db.$transaction(async (tx) => {
    const before = await tx.periodCastTarget.findUniqueOrThrow({
      where: {
        periodId_storeId_userId: {
          periodId: input.periodId,
          storeId: input.storeId,
          userId: input.userId,
        },
      },
    });

    const after = await tx.periodCastTarget.update({
      where: { id: before.id },
      data: {
        targetStatus: input.status,
        exclusionReason: input.reason,
        updatedById: input.actorUserId,
      },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.PERIOD_TARGET_EXCLUDED,
        entityType: "PeriodCastTarget",
        entityId: after.id,
        storeId: input.storeId,
        periodId: input.periodId,
        beforeData: { targetStatus: before.targetStatus },
        afterData: { targetStatus: after.targetStatus },
        reason: input.reason,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return after;
  });
}

export interface RevertToActiveInput {
  periodId: string;
  storeId: string;
  userId: string;
  reason: string;
  actorUserId: string;
  ctx: RequestContext;
}

/** 手動除外の取り消し(復帰)。理由と監査ログを必須とする点は除外時と同様に扱う。 */
export async function revertToActive(input: RevertToActiveInput) {
  return db.$transaction(async (tx) => {
    const before = await tx.periodCastTarget.findUniqueOrThrow({
      where: {
        periodId_storeId_userId: {
          periodId: input.periodId,
          storeId: input.storeId,
          userId: input.userId,
        },
      },
    });

    const after = await tx.periodCastTarget.update({
      where: { id: before.id },
      data: {
        targetStatus: TargetStatus.ACTIVE,
        exclusionReason: null,
        updatedById: input.actorUserId,
      },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.PERIOD_TARGET_REINCLUDED,
        entityType: "PeriodCastTarget",
        entityId: after.id,
        storeId: input.storeId,
        periodId: input.periodId,
        beforeData: { targetStatus: before.targetStatus },
        afterData: { targetStatus: after.targetStatus },
        reason: input.reason,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return after;
  });
}
