import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeShiftDiffs, diffsRequireReason, type DiffInput } from "./shift-diff.ts";

const noDiffBase: DiffInput = {
  availabilityStatus: null,
  availabilityStartAt: null,
  availabilityEndAt: null,
  confirmedStartAt: null,
  confirmedEndAt: null,
  confirmedStoreId: null,
  primaryStoreId: null,
  eventChangedAfterSubmission: false,
  hadPriorConfirmedShift: false,
};

describe("computeShiftDiffs", () => {
  it("returns no diffs when confirmed matches requested exactly", () => {
    const start = new Date("2026-08-01T19:00:00Z");
    const end = new Date("2026-08-02T01:00:00Z");
    const diffs = computeShiftDiffs({
      ...noDiffBase,
      availabilityStatus: "PREFERRED",
      availabilityStartAt: start,
      availabilityEndAt: end,
      confirmedStartAt: start,
      confirmedEndAt: end,
      confirmedStoreId: "store-1",
      primaryStoreId: "store-1",
    });
    assert.deepEqual(diffs, []);
  });

  it("flags OFF_BUT_SCHEDULED when confirmed despite requesting OFF", () => {
    const diffs = computeShiftDiffs({
      ...noDiffBase,
      availabilityStatus: "OFF",
      confirmedStartAt: new Date("2026-08-01T19:00:00Z"),
      confirmedEndAt: new Date("2026-08-01T23:00:00Z"),
    });
    assert.ok(diffs.includes("OFF_BUT_SCHEDULED"));
  });

  it("flags EARLIER_THAN_REQUESTED and LONGER_THAN_REQUESTED for an earlier start", () => {
    const diffs = computeShiftDiffs({
      ...noDiffBase,
      availabilityStatus: "AVAILABLE",
      availabilityStartAt: new Date("2026-08-01T20:00:00Z"),
      availabilityEndAt: new Date("2026-08-01T23:00:00Z"),
      confirmedStartAt: new Date("2026-08-01T18:00:00Z"),
      confirmedEndAt: new Date("2026-08-01T23:00:00Z"),
    });
    assert.ok(diffs.includes("EARLIER_THAN_REQUESTED"));
    assert.ok(diffs.includes("LONGER_THAN_REQUESTED"));
    assert.ok(!diffs.includes("LATER_THAN_REQUESTED"));
    assert.ok(!diffs.includes("SHORTER_THAN_REQUESTED"));
  });

  it("flags SHORTER_THAN_REQUESTED when the confirmed window is a subset", () => {
    const diffs = computeShiftDiffs({
      ...noDiffBase,
      availabilityStatus: "AVAILABLE",
      availabilityStartAt: new Date("2026-08-01T18:00:00Z"),
      availabilityEndAt: new Date("2026-08-01T23:00:00Z"),
      confirmedStartAt: new Date("2026-08-01T19:00:00Z"),
      confirmedEndAt: new Date("2026-08-01T22:00:00Z"),
    });
    assert.deepEqual(diffs, ["SHORTER_THAN_REQUESTED"]);
  });

  it("flags STORE_DIFFERS_FROM_PRIMARY when confirmed at a different store", () => {
    const diffs = computeShiftDiffs({
      ...noDiffBase,
      availabilityStatus: "AVAILABLE",
      availabilityStartAt: new Date("2026-08-01T19:00:00Z"),
      availabilityEndAt: new Date("2026-08-01T23:00:00Z"),
      confirmedStartAt: new Date("2026-08-01T19:00:00Z"),
      confirmedEndAt: new Date("2026-08-01T23:00:00Z"),
      confirmedStoreId: "store-2",
      primaryStoreId: "store-1",
    });
    assert.deepEqual(diffs, ["STORE_DIFFERS_FROM_PRIMARY"]);
  });

  it("flags DATE_ADDED_BY_ADMIN when there is no availability entry at all", () => {
    const diffs = computeShiftDiffs({
      ...noDiffBase,
      availabilityStatus: null,
      confirmedStartAt: new Date("2026-08-01T19:00:00Z"),
      confirmedEndAt: new Date("2026-08-01T23:00:00Z"),
    });
    assert.ok(diffs.includes("DATE_ADDED_BY_ADMIN"));
  });

  it("flags DATE_REMOVED_BY_ADMIN when a prior confirmed shift is gone", () => {
    const diffs = computeShiftDiffs({ ...noDiffBase, hadPriorConfirmedShift: true });
    assert.deepEqual(diffs, ["DATE_REMOVED_BY_ADMIN"]);
  });
});

describe("diffsRequireReason", () => {
  it("requires a reason for off-but-scheduled", () => {
    assert.equal(diffsRequireReason(["OFF_BUT_SCHEDULED"]), true);
  });
  it("does not require a reason for a merely shorter shift", () => {
    assert.equal(diffsRequireReason(["SHORTER_THAN_REQUESTED"]), false);
  });
  it("does not require a reason when there are no diffs", () => {
    assert.equal(diffsRequireReason([]), false);
  });
});
