import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  businessTimeToDate,
  dateToBusinessTime,
  isValidBusinessTime,
  formatBusinessTime,
} from "./business-time.ts";

describe("businessTimeToDate", () => {
  it("keeps times before 24:00 on the same calendar day", () => {
    const businessDate = new Date(Date.UTC(2026, 7, 1));
    const result = businessTimeToDate(businessDate, { hour: 19, minute: 0 });
    assert.equal(result.toISOString(), "2026-08-01T19:00:00.000Z");
  });

  it("rolls 25:00 over to 01:00 the next calendar day", () => {
    const businessDate = new Date(Date.UTC(2026, 7, 1));
    const result = businessTimeToDate(businessDate, { hour: 25, minute: 0 });
    assert.equal(result.toISOString(), "2026-08-02T01:00:00.000Z");
  });

  it("rolls 30:00 over to 06:00 the next calendar day", () => {
    const businessDate = new Date(Date.UTC(2026, 7, 1));
    const result = businessTimeToDate(businessDate, { hour: 30, minute: 0 });
    assert.equal(result.toISOString(), "2026-08-02T06:00:00.000Z");
  });

  it("rolls over correctly across a month boundary", () => {
    const businessDate = new Date(Date.UTC(2026, 7, 31));
    const result = businessTimeToDate(businessDate, { hour: 26, minute: 30 });
    assert.equal(result.toISOString(), "2026-09-01T02:30:00.000Z");
  });
});

describe("dateToBusinessTime", () => {
  it("is the inverse of businessTimeToDate for same-day times", () => {
    const businessDate = new Date(Date.UTC(2026, 7, 1));
    const abs = businessTimeToDate(businessDate, { hour: 19, minute: 0 });
    assert.deepEqual(dateToBusinessTime(businessDate, abs), { hour: 19, minute: 0 });
  });

  it("is the inverse of businessTimeToDate for next-day extension times", () => {
    const businessDate = new Date(Date.UTC(2026, 7, 1));
    const abs = businessTimeToDate(businessDate, { hour: 25, minute: 0 });
    assert.deepEqual(dateToBusinessTime(businessDate, abs), { hour: 25, minute: 0 });
  });
});

describe("isValidBusinessTime", () => {
  it("accepts 30:00 exactly", () => {
    assert.equal(isValidBusinessTime({ hour: 30, minute: 0 }), true);
  });

  it("rejects times after 30:00", () => {
    assert.equal(isValidBusinessTime({ hour: 30, minute: 30 }), false);
    assert.equal(isValidBusinessTime({ hour: 31, minute: 0 }), false);
  });

  it("rejects minute values other than 0 or 30", () => {
    assert.equal(isValidBusinessTime({ hour: 19, minute: 15 }), false);
  });

  it("accepts ordinary times", () => {
    assert.equal(isValidBusinessTime({ hour: 13, minute: 0 }), true);
    assert.equal(isValidBusinessTime({ hour: 19, minute: 30 }), true);
  });
});

describe("formatBusinessTime", () => {
  it("pads to two digits", () => {
    assert.equal(formatBusinessTime({ hour: 9, minute: 0 }), "09:00");
    assert.equal(formatBusinessTime({ hour: 25, minute: 30 }), "25:30");
  });
});
