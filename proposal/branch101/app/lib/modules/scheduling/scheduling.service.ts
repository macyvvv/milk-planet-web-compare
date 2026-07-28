import "server-only";
import { db } from "@/lib/db";
import { businessTimeToDate, type BusinessTime } from "@/lib/modules/availability/business-time";
import { enumerateDates, toDateKey } from "@/lib/modules/periods/period-dates.ts";
import { getCurrentPrimaryStore } from "@/lib/modules/memberships/memberships.service";
import { computeShiftDiffs, diffsRequireReason, type DiffType } from "./shift-diff";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

export class OptimisticLockError extends Error {
  constructor(public currentVersion: number) {
    super("他の管理者による更新と競合しました。最新の内容を再読み込みしてください。");
  }
}

async function getAvailabilityEntryFor(periodId: string, userId: string, workDate: Date) {
  const submission = await db.availabilitySubmission.findFirst({ where: { periodId, userId } });
  if (!submission) return null;
  return db.availabilityEntry.findUnique({
    where: { submissionId_targetDate: { submissionId: submission.id, targetDate: workDate } },
  });
}

async function hasUnacknowledgedEventChange(periodId: string, userId: string): Promise<boolean> {
  const count = await db.eventAcknowledgement.count({
    where: { periodId, userId, status: "NEEDS_ACK" },
  });
  return count > 0;
}

export interface SaveConfirmedShiftInput {
  periodId: string;
  storeId: string;
  userId: string;
  workDate: Date;
  start: BusinessTime;
  end: BusinessTime;
  adminNote?: string;
  castNote?: string;
  changeReason?: string;
  /** undefined = 新規作成。既存行を更新する場合は、画面表示時点のversionを渡す(楽観的ロック)。 */
  expectedVersion?: number;
  actorUserId: string;
  ctx: RequestContext;
}

/** REQ-SCHED-002,003,006、REQ-CONCURRENCY-001。日付別/キャスト別の両ビューから共通で呼ぶ。 */
export async function saveConfirmedShift(input: SaveConfirmedShiftInput) {
  const startAt = businessTimeToDate(input.workDate, input.start);
  const endAt = businessTimeToDate(input.workDate, input.end);
  if (endAt <= startAt) {
    throw new Error("終了時刻は開始時刻より後にしてください。");
  }

  const [entry, primaryMembership, eventChanged] = await Promise.all([
    getAvailabilityEntryFor(input.periodId, input.userId, input.workDate),
    getCurrentPrimaryStore(input.userId, input.workDate),
    hasUnacknowledgedEventChange(input.periodId, input.userId),
  ]);

  const diffs = computeShiftDiffs({
    availabilityStatus: entry?.availabilityStatus ?? null,
    availabilityStartAt: entry?.startAt ?? null,
    availabilityEndAt: entry?.endAt ?? null,
    confirmedStartAt: startAt,
    confirmedEndAt: endAt,
    confirmedStoreId: input.storeId,
    primaryStoreId: primaryMembership?.storeId ?? null,
    eventChangedAfterSubmission: eventChanged,
    hadPriorConfirmedShift: false,
  });

  if (diffsRequireReason(diffs) && !input.changeReason?.trim()) {
    throw new Error("希望外の配置・時刻変更のため、変更理由の入力が必要です。");
  }

  return db.$transaction(async (tx) => {
    const existing = await tx.confirmedShift.findFirst({
      where: { userId: input.userId, workDate: input.workDate, status: { not: "CANCELLED" } },
    });

    if (existing && input.expectedVersion !== undefined && existing.version !== input.expectedVersion) {
      throw new OptimisticLockError(existing.version);
    }

    const isPostPublication = existing?.status === "PUBLISHED";
    const newVersionNo = (existing?.currentVersionNo ?? 0) + 1;

    const saved = existing
      ? await tx.confirmedShift.update({
          where: { id: existing.id },
          data: {
            periodId: input.periodId,
            storeId: input.storeId,
            startAt,
            endAt,
            adminNote: input.adminNote,
            castNote: input.castNote,
            changeReason: input.changeReason,
            currentVersionNo: newVersionNo,
            version: { increment: 1 },
            updatedById: input.actorUserId,
          },
        })
      : await tx.confirmedShift.create({
          data: {
            periodId: input.periodId,
            storeId: input.storeId,
            userId: input.userId,
            workDate: input.workDate,
            startAt,
            endAt,
            adminNote: input.adminNote,
            castNote: input.castNote,
            changeReason: input.changeReason,
            currentVersionNo: 1,
            createdById: input.actorUserId,
            updatedById: input.actorUserId,
          },
        });

    await tx.confirmedShiftVersion.create({
      data: {
        confirmedShiftId: saved.id,
        versionNo: newVersionNo,
        storeId: saved.storeId,
        workDate: saved.workDate,
        startAt: saved.startAt,
        endAt: saved.endAt,
        status: saved.status,
        adminNote: saved.adminNote,
        castNote: saved.castNote,
        changeReason: saved.changeReason,
        isPostPublicationChange: isPostPublication,
        castNotifiedStatus: isPostPublication ? "NOT_NOTIFIED" : null,
        changedById: input.actorUserId,
      },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: isPostPublication ? AUDIT_ACTIONS.POST_PUBLICATION_CHANGE : AUDIT_ACTIONS.CONFIRMED_SHIFT_SAVED,
        entityType: "ConfirmedShift",
        entityId: saved.id,
        storeId: input.storeId,
        periodId: input.periodId,
        reason: input.changeReason,
        afterData: { startAt: startAt.toISOString(), endAt: endAt.toISOString(), diffs },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return saved;
  });
}

export interface CancelConfirmedShiftInput {
  confirmedShiftId: string;
  reason: string;
  expectedVersion: number;
  actorUserId: string;
  ctx: RequestContext;
}

export async function cancelConfirmedShift(input: CancelConfirmedShiftInput) {
  return db.$transaction(async (tx) => {
    const existing = await tx.confirmedShift.findUniqueOrThrow({ where: { id: input.confirmedShiftId } });
    if (existing.version !== input.expectedVersion) {
      throw new OptimisticLockError(existing.version);
    }

    const isPostPublication = existing.status === "PUBLISHED";
    const newVersionNo = existing.currentVersionNo + 1;

    const saved = await tx.confirmedShift.update({
      where: { id: existing.id },
      data: {
        status: "CANCELLED",
        changeReason: input.reason,
        currentVersionNo: newVersionNo,
        version: { increment: 1 },
        updatedById: input.actorUserId,
      },
    });

    await tx.confirmedShiftVersion.create({
      data: {
        confirmedShiftId: saved.id,
        versionNo: newVersionNo,
        storeId: saved.storeId,
        workDate: saved.workDate,
        startAt: saved.startAt,
        endAt: saved.endAt,
        status: saved.status,
        adminNote: saved.adminNote,
        castNote: saved.castNote,
        changeReason: input.reason,
        isPostPublicationChange: isPostPublication,
        castNotifiedStatus: isPostPublication ? "NOT_NOTIFIED" : null,
        changedById: input.actorUserId,
      },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.CONFIRMED_SHIFT_CANCELLED,
        entityType: "ConfirmedShift",
        entityId: saved.id,
        storeId: saved.storeId,
        periodId: saved.periodId,
        reason: input.reason,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return saved;
  });
}

/** 日付別ビュー(state_transitions.md, screen_spec.md)。 */
export async function getSchedulingDataByDate(periodId: string, storeId: string, workDate: Date) {
  const targets = await db.periodCastTarget.findMany({
    where: { periodId, storeId, targetStatus: "ACTIVE" },
    include: { user: true },
    orderBy: [{ user: { displayNameKana: "asc" } }, { user: { displayName: "asc" } }],
  });

  const shifts = await db.confirmedShift.findMany({
    where: { periodId, workDate, userId: { in: targets.map((t) => t.userId) }, status: { not: "CANCELLED" } },
  });
  const shiftByUser = new Map(shifts.map((s) => [s.userId, s]));

  const rows = await Promise.all(
    targets.map(async (target) => {
      const entry = await getAvailabilityEntryFor(periodId, target.userId, workDate);
      return { user: target.user, entry, confirmedShift: shiftByUser.get(target.userId) ?? null };
    }),
  );

  return rows;
}

/** キャスト別ビュー(ピリオド内の全日)。日付別ビューと同じ保存関数を使う。 */
export async function getSchedulingDataByCast(periodId: string, storeId: string, userId: string) {
  const period = await db.period.findUniqueOrThrow({ where: { id: periodId } });
  const dates = enumerateDates(period.startDate, period.endDate);

  const shifts = await db.confirmedShift.findMany({
    where: { periodId, userId, status: { not: "CANCELLED" } },
  });
  const shiftByDate = new Map(shifts.map((s) => [toDateKey(s.workDate), s]));

  const rows = await Promise.all(
    dates.map(async (date) => {
      const entry = await getAvailabilityEntryFor(periodId, userId, date);
      return { workDate: date, entry, confirmedShift: shiftByDate.get(toDateKey(date)) ?? null };
    }),
  );

  return rows;
}

export interface ShiftDifferenceRow {
  userId: string;
  displayName: string;
  workDate: Date;
  diffs: DiffType[];
  confirmedShiftId: string | null;
  changeReason: string | null;
  updatedById: string | null;
  updatedAt: Date | null;
}

/** REQ-SCHED-004,005: 差分一覧。 */
export async function listShiftDifferences(periodId: string, storeId: string): Promise<ShiftDifferenceRow[]> {
  const period = await db.period.findUniqueOrThrow({ where: { id: periodId } });
  const dates = enumerateDates(period.startDate, period.endDate);
  const targets = await db.periodCastTarget.findMany({
    where: { periodId, storeId, targetStatus: "ACTIVE" },
    include: { user: true },
  });

  const results: ShiftDifferenceRow[] = [];

  for (const target of targets) {
    const primaryMembership = await getCurrentPrimaryStore(target.userId);
    const eventChanged = await hasUnacknowledgedEventChange(periodId, target.userId);

    for (const date of dates) {
      const [entry, shift] = await Promise.all([
        getAvailabilityEntryFor(periodId, target.userId, date),
        db.confirmedShift.findFirst({
          where: { userId: target.userId, workDate: date, status: { not: "CANCELLED" } },
        }),
      ]);

      const diffs = computeShiftDiffs({
        availabilityStatus: entry?.availabilityStatus ?? null,
        availabilityStartAt: entry?.startAt ?? null,
        availabilityEndAt: entry?.endAt ?? null,
        confirmedStartAt: shift?.startAt ?? null,
        confirmedEndAt: shift?.endAt ?? null,
        confirmedStoreId: shift?.storeId ?? null,
        primaryStoreId: primaryMembership?.storeId ?? null,
        eventChangedAfterSubmission: eventChanged,
        hadPriorConfirmedShift: false,
      });

      if (diffs.length > 0) {
        results.push({
          userId: target.userId,
          displayName: target.user.displayName,
          workDate: date,
          diffs,
          confirmedShiftId: shift?.id ?? null,
          changeReason: shift?.changeReason ?? null,
          updatedById: shift?.updatedById ?? null,
          updatedAt: shift?.updatedAt ?? null,
        });
      }
    }
  }

  return results;
}

/** キャスト向け「自分の希望と確定の差分閲覧」。公開済みの日のみ対象(authorization_matrix.md)。 */
export async function listShiftDifferencesForCast(userId: string): Promise<ShiftDifferenceRow[]> {
  const publishedEntries = await db.publishedShiftEntry.findMany({ where: { userId } });
  if (publishedEntries.length === 0) return [];

  const primaryMembership = await getCurrentPrimaryStore(userId);
  const results: ShiftDifferenceRow[] = [];

  for (const published of publishedEntries) {
    const publication = await db.shiftPublication.findUniqueOrThrow({
      where: { id: published.publicationId },
    });
    const [entry, eventChanged] = await Promise.all([
      getAvailabilityEntryFor(publication.periodId, userId, published.workDate),
      hasUnacknowledgedEventChange(publication.periodId, userId),
    ]);

    const diffs = computeShiftDiffs({
      availabilityStatus: entry?.availabilityStatus ?? null,
      availabilityStartAt: entry?.startAt ?? null,
      availabilityEndAt: entry?.endAt ?? null,
      confirmedStartAt: published.startAt,
      confirmedEndAt: published.endAt,
      confirmedStoreId: published.storeId,
      primaryStoreId: primaryMembership?.storeId ?? null,
      eventChangedAfterSubmission: eventChanged,
      hadPriorConfirmedShift: false,
    });

    if (diffs.length > 0) {
      results.push({
        userId,
        displayName: "",
        workDate: published.workDate,
        diffs,
        confirmedShiftId: null,
        changeReason: null,
        updatedById: null,
        updatedAt: null,
      });
    }
  }

  return results;
}

export interface ConfirmSchedulingInput {
  periodId: string;
  storeId: string;
  actorUserId: string;
  ctx: RequestContext;
}

/** state_transitions.md 1章: SCHEDULING→CONFIRMED。DRAFTの確定シフトをCONFIRMEDへ一括更新する。 */
export async function confirmScheduling(input: ConfirmSchedulingInput) {
  return db.$transaction(async (tx) => {
    await tx.confirmedShift.updateMany({
      where: { periodId: input.periodId, storeId: input.storeId, status: "DRAFT" },
      data: { status: "CONFIRMED" },
    });

    const setting = await tx.periodStoreSetting.update({
      where: { periodId_storeId: { periodId: input.periodId, storeId: input.storeId } },
      data: { schedulingStatus: "CONFIRMED" },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.SCHEDULING_CONFIRMED,
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
