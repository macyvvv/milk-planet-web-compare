import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeHalfPeriodsForMonth, addMonthsUTC, enumerateDates } from "./period-dates.ts";

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

describe("computeHalfPeriodsForMonth", () => {
  it("splits a 31-day month into 1-15 and 16-31", () => {
    const [first, second] = computeHalfPeriodsForMonth(2026, 1);
    assert.equal(iso(first.startDate), "2026-01-01");
    assert.equal(iso(first.endDate), "2026-01-15");
    assert.equal(iso(second.startDate), "2026-01-16");
    assert.equal(iso(second.endDate), "2026-01-31");
  });

  it("splits a 30-day month into 1-15 and 16-30", () => {
    const [, second] = computeHalfPeriodsForMonth(2026, 4);
    assert.equal(iso(second.endDate), "2026-04-30");
  });

  it("handles February in a non-leap year (28 days)", () => {
    const [, second] = computeHalfPeriodsForMonth(2026, 2);
    assert.equal(iso(second.endDate), "2026-02-28");
  });

  it("handles February in a leap year (29 days)", () => {
    const [, second] = computeHalfPeriodsForMonth(2028, 2);
    assert.equal(iso(second.endDate), "2028-02-29");
  });
});

describe("enumerateDates", () => {
  it("returns an inclusive list of dates", () => {
    const dates = enumerateDates(new Date(Date.UTC(2026, 0, 14)), new Date(Date.UTC(2026, 0, 16)));
    assert.deepEqual(
      dates.map(iso),
      ["2026-01-14", "2026-01-15", "2026-01-16"],
    );
  });

  it("returns a single date when start equals end", () => {
    const d = new Date(Date.UTC(2026, 0, 1));
    assert.deepEqual(enumerateDates(d, d).map(iso), ["2026-01-01"]);
  });
});

describe("addMonthsUTC", () => {
  it("adds months within the same year", () => {
    assert.deepEqual(addMonthsUTC({ year: 2026, month: 3 }, 2), { year: 2026, month: 5 });
  });

  it("rolls over to the next year", () => {
    assert.deepEqual(addMonthsUTC({ year: 2026, month: 11 }, 3), { year: 2027, month: 2 });
  });

  it("rolls back across a year boundary with negative delta", () => {
    assert.deepEqual(addMonthsUTC({ year: 2026, month: 1 }, -1), { year: 2025, month: 12 });
  });
});
