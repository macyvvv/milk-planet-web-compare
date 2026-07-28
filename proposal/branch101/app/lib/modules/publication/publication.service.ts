import "server-only";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

export interface PublishInput {
  periodId: string;
  storeId: string;
  actorUserId: string;
  ctx: RequestContext;
}

/**
 * REQ-PUB-001,002: 店舗・ピリオド単位の公開版を生成する(不変スナップショット)。
 * D-005: 公開後変更は別操作で記録するのみとし、この関数(=再公開)を呼んだ時だけ新しい公開版を追加する。
 */
export async function publishShifts(input: PublishInput) {
  return db.$transaction(async (tx) => {
    const setting = await tx.periodStoreSetting.findUniqueOrThrow({
      where: { periodId_storeId: { periodId: input.periodId, storeId: input.storeId } },
    });
    if (setting.schedulingStatus !== "CONFIRMED") {
      throw new Error("先に確定シフトを確定してください。");
    }

    const lastPublication = await tx.shiftPublication.findFirst({
      where: { periodId: input.periodId, storeId: input.storeId },
      orderBy: { publicationNo: "desc" },
    });
    const publicationNo = (lastPublication?.publicationNo ?? 0) + 1;

    const publication = await tx.shiftPublication.create({
      data: {
        periodId: input.periodId,
        storeId: input.storeId,
        publicationNo,
        publishedById: input.actorUserId,
      },
    });

    const shifts = await tx.confirmedShift.findMany({
      where: { periodId: input.periodId, storeId: input.storeId, status: { in: ["CONFIRMED", "PUBLISHED"] } },
    });

    for (const shift of shifts) {
      await tx.publishedShiftEntry.create({
        data: {
          publicationId: publication.id,
          userId: shift.userId,
          storeId: shift.storeId,
          workDate: shift.workDate,
          startAt: shift.startAt,
          endAt: shift.endAt,
          adminNoteSnapshot: shift.adminNote,
          castNoteSnapshot: shift.castNote,
        },
      });
    }

    await tx.confirmedShift.updateMany({
      where: { periodId: input.periodId, storeId: input.storeId, status: "CONFIRMED" },
      data: { status: "PUBLISHED" },
    });

    await tx.periodStoreSetting.update({
      where: { id: setting.id },
      data: { publicationStatus: "PUBLISHED", publishedAt: new Date() },
    });

    await recordAuditLog(
      {
        actorUserId: input.actorUserId,
        action: AUDIT_ACTIONS.SHIFT_PUBLISHED,
        entityType: "ShiftPublication",
        entityId: publication.id,
        storeId: input.storeId,
        periodId: input.periodId,
        afterData: { publicationNo },
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );

    return publication;
  });
}

export async function getLatestPublishedEntries(periodId: string, storeId: string, userId?: string) {
  const publication = await db.shiftPublication.findFirst({
    where: { periodId, storeId },
    orderBy: { publicationNo: "desc" },
  });
  if (!publication) return { publication: null, entries: [] };

  const entries = await db.publishedShiftEntry.findMany({
    where: { publicationId: publication.id, ...(userId ? { userId } : {}) },
    orderBy: { workDate: "asc" },
  });
  return { publication, entries };
}

/** キャスト向け: 所属を問わず、自分が公開版に載っている全店舗・全ピリオド分。 */
export async function listPublishedEntriesForCast(userId: string) {
  const entries = await db.publishedShiftEntry.findMany({
    where: { userId },
    include: { publication: { include: { period: true } } },
    orderBy: { workDate: "desc" },
    take: 100,
  });

  const stores = await db.store.findMany({ where: { id: { in: entries.map((e) => e.storeId) } } });
  const storeNameById = new Map(stores.map((s) => [s.id, s.name]));

  return entries.map((entry) => ({ ...entry, storeName: storeNameById.get(entry.storeId) ?? "" }));
}

/** D-005残存リスクの緩和策: 未反映(未再公開)の公開後変更件数を表示する。 */
export async function countUnpublishedPostPublicationChanges(periodId: string, storeId: string) {
  return db.confirmedShiftVersion.count({
    where: {
      isPostPublicationChange: true,
      confirmedShift: { periodId, storeId },
    },
  });
}

export interface MarkNotifiedInput {
  confirmedShiftVersionId: string;
  actorUserId: string;
}

/** REQ-PUB-003: 公開後変更の「キャストへの連絡済み状態」を更新する。 */
export async function markPostPublicationChangeNotified(input: MarkNotifiedInput) {
  return db.confirmedShiftVersion.update({
    where: { id: input.confirmedShiftVersionId },
    data: { castNotifiedStatus: "NOTIFIED", notifiedAt: new Date(), notifiedById: input.actorUserId },
  });
}

export async function listPostPublicationChanges(periodId: string, storeId: string) {
  return db.confirmedShiftVersion.findMany({
    where: { isPostPublicationChange: true, confirmedShift: { periodId, storeId } },
    include: { confirmedShift: { include: { user: true } } },
    orderBy: { changedAt: "desc" },
  });
}
