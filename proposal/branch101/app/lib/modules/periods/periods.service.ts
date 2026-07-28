import "server-only";
import { db } from "@/lib/db";
import { computeHalfPeriodsForMonth, addMonthsUTC } from "./period-dates.ts";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

const DEFAULT_MONTHS_AHEAD = 12;

/**
 * REQ-PERIOD-002,003: 冪等にピリオドを生成する(参照時の不足分生成、D-003の経路A)。
 * unique(startDate, endDate) への upsert なので何度呼んでも重複を作らない。
 */
export async function ensurePeriodsGenerated(
  referenceDate: Date = new Date(),
  monthsAhead = DEFAULT_MONTHS_AHEAD,
): Promise<void> {
  const base = { year: referenceDate.getUTCFullYear(), month: referenceDate.getUTCMonth() + 1 };

  for (let i = 0; i <= monthsAhead; i++) {
    const { year, month } = addMonthsUTC(base, i);
    const [first, second] = computeHalfPeriodsForMonth(year, month);

    for (const half of [first, second]) {
      await db.period.upsert({
        where: { startDate_endDate: { startDate: half.startDate, endDate: half.endDate } },
        create: half,
        update: {},
      });
    }
  }
}

export async function listPeriods(limit = 26) {
  return db.period.findMany({ orderBy: { startDate: "asc" }, take: limit });
}

/** Ensures a period_store_settings row exists (does not overwrite an existing one). */
export async function getOrCreatePeriodStoreSettings(periodId: string, storeId: string) {
  return db.periodStoreSetting.upsert({
    where: { periodId_storeId: { periodId, storeId } },
    create: { periodId, storeId },
    update: {},
  });
}

export async function listPeriodStoreSettingsForStore(storeId: string, limit = 26) {
  return db.periodStoreSetting.findMany({
    where: { storeId },
    include: { period: true },
    orderBy: { period: { startDate: "asc" } },
    take: limit,
  });
}

export interface SuggestedPeriod {
  periodId: string;
  startDate: Date;
  endDate: Date;
  submissionDeadlineAt: Date | null;
  reason: "OPEN_BEFORE_DEADLINE" | "NEXT_PERIOD";
}

/**
 * REQ-PERIOD-006: 1) 受付中かつ締切前を最優先、複数あれば締切が近いもの、2) なければ次ピリオド。
 * 呼び出し元はこの結果を初期値として使い、利用者はいつでも他ピリオドへ切り替えられる(UI側の責務)。
 */
export async function suggestPeriodForStore(
  storeId: string,
  now: Date = new Date(),
): Promise<SuggestedPeriod | null> {
  const openCandidate = await db.periodStoreSetting.findFirst({
    where: { storeId, collectionStatus: "OPEN", submissionDeadlineAt: { gt: now } },
    include: { period: true },
    orderBy: { submissionDeadlineAt: "asc" },
  });

  if (openCandidate) {
    return {
      periodId: openCandidate.periodId,
      startDate: openCandidate.period.startDate,
      endDate: openCandidate.period.endDate,
      submissionDeadlineAt: openCandidate.submissionDeadlineAt,
      reason: "OPEN_BEFORE_DEADLINE",
    };
  }

  const next = await db.period.findFirst({
    where: { startDate: { gt: now } },
    orderBy: { startDate: "asc" },
  });
  if (!next) return null;

  const settings = await db.periodStoreSetting.findUnique({
    where: { periodId_storeId: { periodId: next.id, storeId } },
  });

  return {
    periodId: next.id,
    startDate: next.startDate,
    endDate: next.endDate,
    submissionDeadlineAt: settings?.submissionDeadlineAt ?? null,
    reason: "NEXT_PERIOD",
  };
}

export interface SetDeadlineInput {
  periodId: string;
  storeId: string;
  submissionOpenAt: Date;
  submissionDeadlineAt: Date;
  actorUserId: string;
  ctx: RequestContext;
}

/** REQ-PERIOD-004,005: 店舗ごとの締切設定。 */
export async function setDeadline(input: SetDeadlineInput) {
  return db.$transaction(async (tx) => {
    const setting = await tx.periodStoreSetting.upsert({
      where: { periodId_storeId: { periodId: input.periodId, storeId: input.storeId } },
      create: {
        periodId: input.periodId,
        storeId: input.storeId,
        submissionOpenAt: input.submissionOpenAt,
        submissionDeadlineAt: input.submissionDeadlineAt,
      },
      update: {
        submissionOpenAt: input.submissionOpenAt,
        submissionDeadlineAt: input.submissionDeadlineAt,
      },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.PERIOD_DEADLINE_SET,
        entityType: "PeriodStoreSetting",
        entityId: setting.id,
        storeId: input.storeId,
        periodId: input.periodId,
        afterData: {
          submissionOpenAt: input.submissionOpenAt,
          submissionDeadlineAt: input.submissionDeadlineAt,
        },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return setting;
  });
}

export interface ConfirmEventsInput {
  periodId: string;
  storeId: string;
  actorUserId: string;
  ctx: RequestContext;
}

/** REQ-EVENT-003 / D-007: 受付開始前の「イベント確認済み」操作。 */
export async function confirmEventsForOpening(input: ConfirmEventsInput) {
  return db.$transaction(async (tx) => {
    const setting = await tx.periodStoreSetting.upsert({
      where: { periodId_storeId: { periodId: input.periodId, storeId: input.storeId } },
      create: {
        periodId: input.periodId,
        storeId: input.storeId,
        eventsConfirmedAt: new Date(),
        eventsConfirmedById: input.actorUserId,
      },
      update: { eventsConfirmedAt: new Date(), eventsConfirmedById: input.actorUserId },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.PERIOD_EVENTS_CONFIRMED,
        entityType: "PeriodStoreSetting",
        entityId: setting.id,
        storeId: input.storeId,
        periodId: input.periodId,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return setting;
  });
}

export interface OpenCollectionInput {
  periodId: string;
  storeId: string;
  actorUserId: string;
  ctx: RequestContext;
}

/**
 * state_transitions.md 1章: PREPARING→OPEN。イベント確認済み・締切設定済みをガードする。
 * 対象キャストが未生成なら合わせて生成する(REQ-TARGET-001)。
 */
export async function openCollection(input: OpenCollectionInput) {
  const setting = await db.periodStoreSetting.findUnique({
    where: { periodId_storeId: { periodId: input.periodId, storeId: input.storeId } },
  });

  if (!setting) {
    throw new Error("締切設定がありません。先に締切を設定してください。");
  }
  if (!setting.eventsConfirmedAt) {
    throw new Error("イベント確認済みにしてから受付を開始してください。");
  }
  if (!setting.submissionOpenAt || !setting.submissionDeadlineAt) {
    throw new Error("受付開始日時・締切日時が未設定です。");
  }
  if (setting.collectionStatus !== "PREPARING") {
    throw new Error("このピリオド・店舗はすでに準備中の状態ではありません。");
  }

  return db.$transaction(async (tx) => {
    const updated = await tx.periodStoreSetting.update({
      where: { id: setting.id },
      data: { collectionStatus: "OPEN" },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.PERIOD_COLLECTION_OPENED,
        entityType: "PeriodStoreSetting",
        entityId: setting.id,
        storeId: input.storeId,
        periodId: input.periodId,
        beforeData: { collectionStatus: setting.collectionStatus },
        afterData: { collectionStatus: updated.collectionStatus },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return updated;
  });
}

export interface CloseCollectionInput {
  periodId: string;
  storeId: string;
  actorUserId: string;
  ctx: RequestContext;
}

/** state_transitions.md 1章: OPEN→CLOSED(管理者による早期締切、または締切到達時)。 */
export async function closeCollection(input: CloseCollectionInput) {
  const setting = await db.periodStoreSetting.findUniqueOrThrow({
    where: { periodId_storeId: { periodId: input.periodId, storeId: input.storeId } },
  });

  if (setting.collectionStatus !== "OPEN") {
    throw new Error("受付中の状態ではありません。");
  }

  return db.$transaction(async (tx) => {
    const updated = await tx.periodStoreSetting.update({
      where: { id: setting.id },
      data: { collectionStatus: "CLOSED" },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.PERIOD_COLLECTION_CLOSED,
        entityType: "PeriodStoreSetting",
        entityId: setting.id,
        storeId: input.storeId,
        periodId: input.periodId,
        beforeData: { collectionStatus: setting.collectionStatus },
        afterData: { collectionStatus: updated.collectionStatus },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return updated;
  });
}
