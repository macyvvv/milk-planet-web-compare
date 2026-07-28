// REQ-SCHED-004: 希望と確定の差分判定。DBに触れない純粋関数として単体テスト対象にする。

export type DiffType =
  | "OFF_BUT_SCHEDULED"
  | "EARLIER_THAN_REQUESTED"
  | "LATER_THAN_REQUESTED"
  | "SHORTER_THAN_REQUESTED"
  | "LONGER_THAN_REQUESTED"
  | "STORE_DIFFERS_FROM_PRIMARY"
  | "EVENT_CHANGED_AFTER_SUBMISSION"
  | "DATE_ADDED_BY_ADMIN"
  | "DATE_REMOVED_BY_ADMIN";

export interface DiffInput {
  /** null = このピリオドで希望が提出されていない日(=管理者が追加した日の可能性)。 */
  availabilityStatus: "OFF" | "AVAILABLE" | "PREFERRED" | "TIME_NEGOTIABLE" | null;
  availabilityStartAt: Date | null;
  availabilityEndAt: Date | null;
  /** null = 現在この日に確定配置がない。 */
  confirmedStartAt: Date | null;
  confirmedEndAt: Date | null;
  confirmedStoreId: string | null;
  primaryStoreId: string | null;
  eventChangedAfterSubmission: boolean;
  /** 直前まで確定配置が存在していた(=今回削除された)か。 */
  hadPriorConfirmedShift: boolean;
}

/** 希望外配置・大幅な時刻変更(理由必須)に該当する差分種別。REQ-SCHED-006。 */
export const REASON_REQUIRED_DIFFS: ReadonlySet<DiffType> = new Set([
  "OFF_BUT_SCHEDULED",
  "STORE_DIFFERS_FROM_PRIMARY",
  "EARLIER_THAN_REQUESTED",
  "LATER_THAN_REQUESTED",
]);

export function computeShiftDiffs(input: DiffInput): DiffType[] {
  const diffs: DiffType[] = [];
  const hasConfirmed = input.confirmedStartAt !== null && input.confirmedEndAt !== null;

  if (input.availabilityStatus === "OFF" && hasConfirmed) {
    diffs.push("OFF_BUT_SCHEDULED");
  }

  if (
    hasConfirmed &&
    input.availabilityStatus &&
    input.availabilityStatus !== "OFF" &&
    input.availabilityStartAt &&
    input.availabilityEndAt
  ) {
    const confirmedStart = input.confirmedStartAt as Date;
    const confirmedEnd = input.confirmedEndAt as Date;

    if (confirmedStart < input.availabilityStartAt) diffs.push("EARLIER_THAN_REQUESTED");
    if (confirmedEnd > input.availabilityEndAt) diffs.push("LATER_THAN_REQUESTED");

    const confirmedMinutes = confirmedEnd.getTime() - confirmedStart.getTime();
    const requestedMinutes = input.availabilityEndAt.getTime() - input.availabilityStartAt.getTime();
    if (confirmedMinutes < requestedMinutes) diffs.push("SHORTER_THAN_REQUESTED");
    if (confirmedMinutes > requestedMinutes) diffs.push("LONGER_THAN_REQUESTED");
  }

  if (
    hasConfirmed &&
    input.confirmedStoreId &&
    input.primaryStoreId &&
    input.confirmedStoreId !== input.primaryStoreId
  ) {
    diffs.push("STORE_DIFFERS_FROM_PRIMARY");
  }

  if (input.eventChangedAfterSubmission) diffs.push("EVENT_CHANGED_AFTER_SUBMISSION");
  if (hasConfirmed && input.availabilityStatus === null) diffs.push("DATE_ADDED_BY_ADMIN");
  if (!hasConfirmed && input.hadPriorConfirmedShift) diffs.push("DATE_REMOVED_BY_ADMIN");

  return diffs;
}

export function diffsRequireReason(diffs: DiffType[]): boolean {
  return diffs.some((d) => REASON_REQUIRED_DIFFS.has(d));
}
