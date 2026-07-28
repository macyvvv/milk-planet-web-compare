import "server-only";
import { db } from "@/lib/db";
import { AvailabilityStatus } from "@/app/generated/prisma/client";
import { enumerateDates, toDateKey } from "@/lib/modules/periods/period-dates.ts";
import { getStandardShift } from "./standard-shift.service";
import {
  businessTimeToDate,
  dateToBusinessTime,
  isValidBusinessTime,
  type BusinessTime,
} from "./business-time";
import { isSubmissionEditable, isLateSubmission } from "./submission-editability";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

export async function getOrCreateSubmission(periodId: string, storeId: string, userId: string) {
  return db.availabilitySubmission.upsert({
    where: { periodId_storeId_userId: { periodId, storeId, userId } },
    create: { periodId, storeId, userId },
    update: {},
  });
}

async function assertEditable(periodId: string, storeId: string, submissionId: string): Promise<void> {
  const [setting, submission] = await Promise.all([
    db.periodStoreSetting.findUnique({ where: { periodId_storeId: { periodId, storeId } } }),
    db.availabilitySubmission.findUniqueOrThrow({ where: { id: submissionId } }),
  ]);

  const editable = isSubmissionEditable({
    collectionStatus: setting?.collectionStatus ?? "PREPARING",
    submissionOpenAt: setting?.submissionOpenAt ?? null,
    submissionDeadlineAt: setting?.submissionDeadlineAt ?? null,
    lastReopenDeadlineAt: submission.lastReopenDeadlineAt,
    now: new Date(),
  });

  if (!editable) {
    throw new Error("現在は入力できません(受付期間外、または締切を過ぎています)。");
  }
}

export interface AvailabilityScreenData {
  periodId: string;
  storeId: string;
  dates: Date[];
  submission: Awaited<ReturnType<typeof getOrCreateSubmission>>;
  entriesByDate: Map<string, { availabilityStatus: AvailabilityStatus; start: BusinessTime | null; end: BusinessTime | null; note: string }>;
  eventNamesByDate: Map<string, string[]>;
  editable: boolean;
}

export async function getAvailabilityScreenData(
  periodId: string,
  storeId: string,
  userId: string,
): Promise<AvailabilityScreenData> {
  const [period, setting, submission] = await Promise.all([
    db.period.findUniqueOrThrow({ where: { id: periodId } }),
    db.periodStoreSetting.findUnique({ where: { periodId_storeId: { periodId, storeId } } }),
    getOrCreateSubmission(periodId, storeId, userId),
  ]);

  const dates = enumerateDates(period.startDate, period.endDate);

  const [entries, events] = await Promise.all([
    db.availabilityEntry.findMany({ where: { submissionId: submission.id } }),
    db.event.findMany({
      where: {
        status: "ACTIVE",
        eventDate: { gte: period.startDate, lte: period.endDate },
        OR: [{ isAllStores: true }, { stores: { some: { storeId } } }],
      },
    }),
  ]);

  const entriesByDate = new Map<
    string,
    { availabilityStatus: AvailabilityStatus; start: BusinessTime | null; end: BusinessTime | null; note: string }
  >();
  for (const entry of entries) {
    const key = toDateKey(entry.targetDate);
    entriesByDate.set(key, {
      availabilityStatus: entry.availabilityStatus,
      start: entry.startAt ? dateToBusinessTime(entry.targetDate, entry.startAt) : null,
      end: entry.endAt ? dateToBusinessTime(entry.targetDate, entry.endAt) : null,
      note: entry.note ?? "",
    });
  }

  const eventNamesByDate = new Map<string, string[]>();
  for (const event of events) {
    const key = toDateKey(event.eventDate);
    const list = eventNamesByDate.get(key) ?? [];
    list.push(event.name);
    eventNamesByDate.set(key, list);
  }

  const editable = isSubmissionEditable({
    collectionStatus: setting?.collectionStatus ?? "PREPARING",
    submissionOpenAt: setting?.submissionOpenAt ?? null,
    submissionDeadlineAt: setting?.submissionDeadlineAt ?? null,
    lastReopenDeadlineAt: submission.lastReopenDeadlineAt,
    now: new Date(),
  });

  return { periodId, storeId, dates, submission, entriesByDate, eventNamesByDate, editable };
}

export interface DraftEntryInput {
  targetDate: Date;
  availabilityStatus: AvailabilityStatus;
  start: BusinessTime | null;
  end: BusinessTime | null;
  note: string;
}

export interface SaveDraftInput {
  periodId: string;
  storeId: string;
  userId: string;
  entries: DraftEntryInput[];
  ctx: RequestContext;
}

/** REQ-AVAIL-001,003,005,006: 下書き保存。OFF以外は時刻必須で、業務日基準を絶対日時へ正規化する。 */
export async function saveDraftEntries(input: SaveDraftInput): Promise<void> {
  const submission = await getOrCreateSubmission(input.periodId, input.storeId, input.userId);
  await assertEditable(input.periodId, input.storeId, submission.id);

  for (const entry of input.entries) {
    if (entry.availabilityStatus !== AvailabilityStatus.OFF) {
      if (!entry.start || !entry.end || !isValidBusinessTime(entry.start) || !isValidBusinessTime(entry.end)) {
        throw new Error("休み以外は開始・終了時刻を正しく入力してください。");
      }
    }
  }

  await db.$transaction(async (tx) => {
    for (const entry of input.entries) {
      const startAt =
        entry.availabilityStatus !== AvailabilityStatus.OFF && entry.start
          ? businessTimeToDate(entry.targetDate, entry.start)
          : null;
      const endAt =
        entry.availabilityStatus !== AvailabilityStatus.OFF && entry.end
          ? businessTimeToDate(entry.targetDate, entry.end)
          : null;

      await tx.availabilityEntry.upsert({
        where: { submissionId_targetDate: { submissionId: submission.id, targetDate: entry.targetDate } },
        create: {
          submissionId: submission.id,
          targetDate: entry.targetDate,
          availabilityStatus: entry.availabilityStatus,
          startAt,
          endAt,
          note: entry.note || null,
        },
        update: {
          availabilityStatus: entry.availabilityStatus,
          startAt,
          endAt,
          note: entry.note || null,
        },
      });
    }

    if (submission.headerStatus === "NOT_STARTED") {
      await tx.availabilitySubmission.update({
        where: { id: submission.id },
        data: { headerStatus: "DRAFT" },
      });
    }

    await recordAuditLog(
      {
        actorUserId: input.userId,
        action: AUDIT_ACTIONS.AVAILABILITY_DRAFT_SAVED,
        entityType: "AvailabilitySubmission",
        entityId: submission.id,
        storeId: input.storeId,
        periodId: input.periodId,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );
  });
}

/** REQ-STDSHIFT-002: 標準シフトをピリオド全日へ一括適用する(出勤=AVAILABLE、休み=OFF)。 */
export async function applyStandardShiftToPeriod(
  periodId: string,
  storeId: string,
  userId: string,
  ctx: RequestContext,
): Promise<void> {
  const period = await db.period.findUniqueOrThrow({ where: { id: periodId } });
  const patterns = await getStandardShift(userId);

  const entries: DraftEntryInput[] = enumerateDates(period.startDate, period.endDate).map((date) => {
    const pattern = patterns[date.getUTCDay()];
    return {
      targetDate: date,
      availabilityStatus: pattern.isWorking ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.OFF,
      start: pattern.isWorking ? pattern.start : null,
      end: pattern.isWorking ? pattern.end : null,
      note: pattern.note,
    };
  });

  await saveDraftEntries({ periodId, storeId, userId, entries, ctx });
}

/** REQ-UI-006「全日休み設定」。 */
export async function setAllOff(periodId: string, storeId: string, userId: string, ctx: RequestContext): Promise<void> {
  const period = await db.period.findUniqueOrThrow({ where: { id: periodId } });
  const entries: DraftEntryInput[] = enumerateDates(period.startDate, period.endDate).map((date) => ({
    targetDate: date,
    availabilityStatus: AvailabilityStatus.OFF,
    start: null,
    end: null,
    note: "",
  }));
  await saveDraftEntries({ periodId, storeId, userId, entries, ctx });
}

/** REQ-STDSHIFT-004: 前日コピー(希望状態・時刻・備考のみ。イベント情報はコピーしない)。 */
export async function copyFromPreviousDay(
  periodId: string,
  storeId: string,
  userId: string,
  targetDate: Date,
  ctx: RequestContext,
): Promise<void> {
  const submission = await getOrCreateSubmission(periodId, storeId, userId);
  const previousDate = new Date(
    Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate() - 1),
  );

  const previous = await db.availabilityEntry.findUnique({
    where: { submissionId_targetDate: { submissionId: submission.id, targetDate: previousDate } },
  });
  if (!previous) {
    throw new Error("前日の入力がありません。");
  }

  await saveDraftEntries({
    periodId,
    storeId,
    userId,
    entries: [
      {
        targetDate,
        availabilityStatus: previous.availabilityStatus,
        start: previous.startAt ? dateToBusinessTime(previousDate, previous.startAt) : null,
        end: previous.endAt ? dateToBusinessTime(previousDate, previous.endAt) : null,
        note: previous.note ?? "",
      },
    ],
    ctx,
  });
}

export interface SubmitInput {
  periodId: string;
  storeId: string;
  userId: string;
  ctx: RequestContext;
}

/** REQ-AVAIL-007,008: 全日入力(全日OFFも可)を確認し、提出ヘッダーを進める。提出版を記録する。 */
export async function submitAvailability(input: SubmitInput): Promise<void> {
  const [period, setting, submission] = await Promise.all([
    db.period.findUniqueOrThrow({ where: { id: input.periodId } }),
    db.periodStoreSetting.findUnique({
      where: { periodId_storeId: { periodId: input.periodId, storeId: input.storeId } },
    }),
    getOrCreateSubmission(input.periodId, input.storeId, input.userId),
  ]);

  const editable = isSubmissionEditable({
    collectionStatus: setting?.collectionStatus ?? "PREPARING",
    submissionOpenAt: setting?.submissionOpenAt ?? null,
    submissionDeadlineAt: setting?.submissionDeadlineAt ?? null,
    lastReopenDeadlineAt: submission.lastReopenDeadlineAt,
    now: new Date(),
  });
  if (!editable) {
    throw new Error("現在は提出できません(受付期間外、または締切を過ぎています)。");
  }

  const entries = await db.availabilityEntry.findMany({ where: { submissionId: submission.id } });
  const entryDateKeys = new Set(entries.map((e) => toDateKey(e.targetDate)));
  const missingDates = enumerateDates(period.startDate, period.endDate).filter(
    (d) => !entryDateKeys.has(toDateKey(d)),
  );
  if (missingDates.length > 0) {
    throw new Error(`未入力の日が${missingDates.length}日あります。すべての日を入力してください。`);
  }

  const now = new Date();
  const late = isLateSubmission(setting?.submissionDeadlineAt ?? null, now);
  const newStatus = late ? "LATE_SUBMITTED" : "SUBMITTED";
  const newVersionNo = submission.currentVersionNo + 1;

  await db.$transaction(async (tx) => {
    await tx.availabilitySubmission.update({
      where: { id: submission.id },
      data: {
        headerStatus: newStatus,
        submittedAt: now,
        currentVersionNo: newVersionNo,
        version: { increment: 1 },
      },
    });

    await tx.availabilitySubmissionVersion.create({
      data: {
        submissionId: submission.id,
        versionNo: newVersionNo,
        headerStatusAtSave: newStatus,
        entriesSnapshot: entries.map((e) => ({
          targetDate: toDateKey(e.targetDate),
          availabilityStatus: e.availabilityStatus,
          startAt: e.startAt?.toISOString() ?? null,
          endAt: e.endAt?.toISOString() ?? null,
          note: e.note,
        })),
        createdById: input.userId,
      },
    });

    // state_transitions.md 4章: 再提出はイベント変更の確認を兼ねる。
    await tx.eventAcknowledgement.updateMany({
      where: { userId: input.userId, periodId: input.periodId, status: "NEEDS_ACK" },
      data: { status: "UP_TO_DATE" },
    });

    await recordAuditLog(
      {
        actorUserId: input.userId,
        action: late ? AUDIT_ACTIONS.AVAILABILITY_LATE_SUBMITTED : AUDIT_ACTIONS.AVAILABILITY_SUBMITTED,
        entityType: "AvailabilitySubmission",
        entityId: submission.id,
        storeId: input.storeId,
        periodId: input.periodId,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );
  });
}

export interface ReopenInput {
  submissionId: string;
  deadline: Date;
  reason: string;
  actorUserId: string;
  ctx: RequestContext;
}

/** REQ-AVAIL-010: 管理者による個別受付再開。理由・期限を必須とし監査ログへ記録する。 */
export async function reopenSubmission(input: ReopenInput) {
  return db.$transaction(async (tx) => {
    const before = await tx.availabilitySubmission.findUniqueOrThrow({
      where: { id: input.submissionId },
    });

    const after = await tx.availabilitySubmission.update({
      where: { id: input.submissionId },
      data: {
        lastReopenedAt: new Date(),
        lastReopenedById: input.actorUserId,
        lastReopenReason: input.reason,
        lastReopenDeadlineAt: input.deadline,
      },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.AVAILABILITY_REOPENED,
        entityType: "AvailabilitySubmission",
        entityId: input.submissionId,
        storeId: before.storeId,
        periodId: before.periodId,
        reason: input.reason,
        afterData: { lastReopenDeadlineAt: input.deadline.toISOString() },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return after;
  });
}
