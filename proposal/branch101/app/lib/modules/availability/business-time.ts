// 業務時刻(13:00〜30:00等)の正規化・逆正規化。REQ-AVAIL-005,006。
//
// 「業務日」を基準に、24:00を超える延長時刻を翌カレンダー日の時刻へ変換する。
// 例: 業務日 2026-08-01, 25:00〜 → 実時刻 2026-08-02 01:00〜。
//
// 分の刻みは元指示書に明示がないため、実装判断として30分刻み(00分/30分)を採用する
// (歓楽街の営業時間管理で一般的な粒度。業務フローや権限には影響しない軽微な判断)。

export interface BusinessTime {
  /** 0-30。30は「30:00」のみ有効(30:30等は無効)。24以上は翌日への延長を表す。 */
  hour: number;
  /** 0 or 30. */
  minute: number;
}

export const BUSINESS_TIME_MAX_MINUTES = 30 * 60; // 30:00

export function businessTimeToTotalMinutes(t: BusinessTime): number {
  return t.hour * 60 + t.minute;
}

export function isValidBusinessTime(t: BusinessTime): boolean {
  if (!Number.isInteger(t.hour) || !Number.isInteger(t.minute)) return false;
  if (t.hour < 0 || t.minute < 0) return false;
  if (t.minute !== 0 && t.minute !== 30) return false;
  const total = businessTimeToTotalMinutes(t);
  return total >= 0 && total <= BUSINESS_TIME_MAX_MINUTES;
}

/** businessDate must be a UTC-midnight calendar date (as stored in target_date/work_date columns). */
export function businessTimeToDate(businessDate: Date, time: BusinessTime): Date {
  const dayOffset = Math.floor(time.hour / 24);
  const clockHour = time.hour % 24;
  return new Date(
    Date.UTC(
      businessDate.getUTCFullYear(),
      businessDate.getUTCMonth(),
      businessDate.getUTCDate() + dayOffset,
      clockHour,
      time.minute,
    ),
  );
}

/** Inverse of businessTimeToDate: recovers the business-time-of-day (possibly >= 24:00). */
export function dateToBusinessTime(businessDate: Date, absolute: Date): BusinessTime {
  const businessMidnight = Date.UTC(
    businessDate.getUTCFullYear(),
    businessDate.getUTCMonth(),
    businessDate.getUTCDate(),
  );
  const absoluteMidnight = Date.UTC(
    absolute.getUTCFullYear(),
    absolute.getUTCMonth(),
    absolute.getUTCDate(),
  );
  const dayDiff = Math.round((absoluteMidnight - businessMidnight) / (24 * 60 * 60 * 1000));
  return { hour: absolute.getUTCHours() + dayDiff * 24, minute: absolute.getUTCMinutes() };
}

export function formatBusinessTime(t: BusinessTime): string {
  return `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
}

/** Inverse of formatBusinessTime. Returns null for malformed/out-of-range input (CSV import use). */
export function parseBusinessTime(value: string): BusinessTime | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const time = { hour: Number(match[1]), minute: Number(match[2]) };
  return isValidBusinessTime(time) ? time : null;
}
