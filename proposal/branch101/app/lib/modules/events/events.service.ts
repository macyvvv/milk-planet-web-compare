import "server-only";
import type { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

export interface EventInput {
  name: string;
  eventDate: Date;
  isAllStores: boolean;
  /** Ignored when isAllStores is true. */
  storeIds: string[];
  castNote?: string;
  adminNote?: string;
}

export interface CreateEventInput extends EventInput {
  actorUserId: string;
  ctx: RequestContext;
}

/** REQ-EVENT-001,002: 全店/単一店舗/複数店舗イベント。必要人数等の構造化フィールドは持たない。 */
export async function createEvent(input: CreateEventInput) {
  return db.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        name: input.name,
        eventDate: input.eventDate,
        isAllStores: input.isAllStores,
        castNote: input.castNote,
        adminNote: input.adminNote,
        createdById: input.actorUserId,
        currentVersionNo: 1,
      },
    });

    if (!input.isAllStores && input.storeIds.length > 0) {
      await tx.eventStore.createMany({
        data: input.storeIds.map((storeId) => ({ eventId: event.id, storeId })),
      });
    }

    await tx.eventVersion.create({
      data: {
        eventId: event.id,
        versionNo: 1,
        name: event.name,
        eventDate: event.eventDate,
        isAllStores: event.isAllStores,
        storeIdsSnapshot: JSON.stringify(input.isAllStores ? [] : input.storeIds),
        castNote: event.castNote,
        adminNote: event.adminNote,
        status: event.status,
        changedById: input.actorUserId,
      },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.EVENT_CREATED,
        entityType: "Event",
        entityId: event.id,
        afterData: { name: event.name, eventDate: event.eventDate.toISOString() },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return event;
  });
}

export interface UpdateEventInput extends EventInput {
  eventId: string;
  changeReason?: string;
  actorUserId: string;
  ctx: RequestContext;
}

/**
 * REQ-EVENT-004,005: 変更前後を版として保存し、受付開始後/提出後の変更であれば、対象ピリオドで
 * 既に提出済み(SUBMITTED/LATE_SUBMITTED)のキャストへ「イベント変更後未確認」を一括付与する。
 */
export async function updateEvent(input: UpdateEventInput) {
  return db.$transaction(async (tx) => {
    const before = await tx.event.findUniqueOrThrow({ where: { id: input.eventId } });
    const newVersionNo = before.currentVersionNo + 1;

    const updated = await tx.event.update({
      where: { id: input.eventId },
      data: {
        name: input.name,
        eventDate: input.eventDate,
        isAllStores: input.isAllStores,
        castNote: input.castNote,
        adminNote: input.adminNote,
        currentVersionNo: newVersionNo,
      },
    });

    await tx.eventStore.deleteMany({ where: { eventId: input.eventId } });
    if (!input.isAllStores && input.storeIds.length > 0) {
      await tx.eventStore.createMany({
        data: input.storeIds.map((storeId) => ({ eventId: input.eventId, storeId })),
      });
    }

    await tx.eventVersion.create({
      data: {
        eventId: input.eventId,
        versionNo: newVersionNo,
        name: updated.name,
        eventDate: updated.eventDate,
        isAllStores: updated.isAllStores,
        storeIdsSnapshot: JSON.stringify(input.isAllStores ? [] : input.storeIds),
        castNote: updated.castNote,
        adminNote: updated.adminNote,
        status: updated.status,
        changeReason: input.changeReason,
        changedById: input.actorUserId,
      },
    });

    await markSubmittedCastsNeedAck(tx, input.eventId, updated.eventDate, input.isAllStores, input.storeIds);

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.EVENT_UPDATED,
        entityType: "Event",
        entityId: input.eventId,
        beforeData: { name: before.name, eventDate: before.eventDate.toISOString() },
        afterData: { name: updated.name, eventDate: updated.eventDate.toISOString() },
        reason: input.changeReason,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return updated;
  });
}

export async function markSubmittedCastsNeedAck(
  tx: Prisma.TransactionClient,
  eventId: string,
  eventDate: Date,
  isAllStores: boolean,
  storeIds: string[],
): Promise<void> {
  const period = await tx.period.findFirst({
    where: { startDate: { lte: eventDate }, endDate: { gte: eventDate } },
  });
  if (!period) return; // No period covers this date yet (e.g. far-future event) — nothing to reconcile.

  const affectedStoreIds = isAllStores
    ? (await tx.store.findMany({ where: { status: "ACTIVE" }, select: { id: true } })).map((s) => s.id)
    : storeIds;
  if (affectedStoreIds.length === 0) return;

  const submissions = await tx.availabilitySubmission.findMany({
    where: {
      periodId: period.id,
      storeId: { in: affectedStoreIds },
      headerStatus: { in: ["SUBMITTED", "LATE_SUBMITTED"] },
    },
    select: { userId: true, storeId: true },
  });

  for (const submission of submissions) {
    await tx.eventAcknowledgement.upsert({
      where: {
        eventId_userId_periodId: { eventId, userId: submission.userId, periodId: period.id },
      },
      create: {
        eventId,
        userId: submission.userId,
        periodId: period.id,
        storeId: submission.storeId,
        status: "NEEDS_ACK",
      },
      update: { status: "NEEDS_ACK" },
    });
  }
}

export interface DisableEventInput {
  eventId: string;
  reason?: string;
  actorUserId: string;
  ctx: RequestContext;
}

export async function disableEvent(input: DisableEventInput) {
  return db.$transaction(async (tx) => {
    const before = await tx.event.findUniqueOrThrow({ where: { id: input.eventId } });
    const newVersionNo = before.currentVersionNo + 1;

    const updated = await tx.event.update({
      where: { id: input.eventId },
      data: { status: "DISABLED", currentVersionNo: newVersionNo },
    });

    const stores = await tx.eventStore.findMany({ where: { eventId: input.eventId } });

    await tx.eventVersion.create({
      data: {
        eventId: input.eventId,
        versionNo: newVersionNo,
        name: updated.name,
        eventDate: updated.eventDate,
        isAllStores: updated.isAllStores,
        storeIdsSnapshot: JSON.stringify(stores.map((s) => s.storeId)),
        castNote: updated.castNote,
        adminNote: updated.adminNote,
        status: updated.status,
        changeReason: input.reason,
        changedById: input.actorUserId,
      },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.EVENT_DISABLED,
        entityType: "Event",
        entityId: input.eventId,
        reason: input.reason,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return updated;
  });
}

/** For admin listing: events touching a given store, including all-stores events. */
export async function listEventsForStore(storeId: string) {
  return db.event.findMany({
    where: { OR: [{ isAllStores: true }, { stores: { some: { storeId } } }] },
    include: { stores: true },
    orderBy: { eventDate: "asc" },
  });
}

/** For the availability screen: events on a specific date, for a specific store. */
export async function listEventsForStoreAndDateRange(storeId: string, startDate: Date, endDate: Date) {
  return db.event.findMany({
    where: {
      status: "ACTIVE",
      eventDate: { gte: startDate, lte: endDate },
      OR: [{ isAllStores: true }, { stores: { some: { storeId } } }],
    },
    orderBy: { eventDate: "asc" },
  });
}

export async function countUnacknowledgedForPeriodStore(periodId: string, storeId: string) {
  return db.eventAcknowledgement.count({
    where: { periodId, storeId, status: "NEEDS_ACK" },
  });
}

export interface AcknowledgeEventInput {
  eventId: string;
  userId: string;
  periodId: string;
}

/** キャストが変更内容を確認した(または再提出した)ことを記録する。REQ-EVENT-005, state_transitions.md 4章。 */
export async function acknowledgeEvent(input: AcknowledgeEventInput) {
  const event = await db.event.findUniqueOrThrow({ where: { id: input.eventId } });
  return db.eventAcknowledgement.update({
    where: {
      eventId_userId_periodId: {
        eventId: input.eventId,
        userId: input.userId,
        periodId: input.periodId,
      },
    },
    data: { acknowledgedVersionNo: event.currentVersionNo, status: "UP_TO_DATE" },
  });
}
