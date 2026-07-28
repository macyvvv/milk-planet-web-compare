// All period boundaries are calendar dates (no time-of-day, no timezone) — computed with
// Date.UTC so a developer running this in any local timezone gets the same date. REQ-PERIOD-001.

export interface HalfPeriod {
  startDate: Date;
  endDate: Date;
}

/** month is 1-12. Returns the two fixed half-month periods: 1st–15th and 16th–month end. */
export function computeHalfPeriodsForMonth(year: number, month: number): [HalfPeriod, HalfPeriod] {
  const firstHalf: HalfPeriod = {
    startDate: new Date(Date.UTC(year, month - 1, 1)),
    endDate: new Date(Date.UTC(year, month - 1, 15)),
  };

  // Date.UTC(year, month, 0) is the last day of `month` (1-indexed) — correctly handles
  // 28/29/30/31-day months and leap years without a lookup table.
  const lastDayOfMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const secondHalf: HalfPeriod = {
    startDate: new Date(Date.UTC(year, month - 1, 16)),
    endDate: new Date(Date.UTC(year, month - 1, lastDayOfMonth)),
  };

  return [firstHalf, secondHalf];
}

export interface YearMonth {
  year: number;
  month: number;
}

export function addMonthsUTC(base: YearMonth, delta: number): YearMonth {
  const total = base.year * 12 + (base.month - 1) + delta;
  return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
}

/** Inclusive list of every calendar date from startDate to endDate (both UTC-midnight dates). */
export function enumerateDates(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let cursor = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()),
  );
  const end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());

  while (cursor.getTime() <= end) {
    dates.push(cursor);
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + 1));
  }
  return dates;
}

export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
