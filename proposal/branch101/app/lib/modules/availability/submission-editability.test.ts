import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSubmissionEditable, isLateSubmission } from "./submission-editability.ts";

const open = new Date("2026-07-20T00:00:00Z");
const deadline = new Date("2026-07-28T23:59:00Z");

describe("isSubmissionEditable", () => {
  it("is editable when OPEN and within the submission window", () => {
    assert.equal(
      isSubmissionEditable({
        collectionStatus: "OPEN",
        submissionOpenAt: open,
        submissionDeadlineAt: deadline,
        lastReopenDeadlineAt: null,
        now: new Date("2026-07-25T00:00:00Z"),
      }),
      true,
    );
  });

  it("is not editable before the collection opens", () => {
    assert.equal(
      isSubmissionEditable({
        collectionStatus: "OPEN",
        submissionOpenAt: open,
        submissionDeadlineAt: deadline,
        lastReopenDeadlineAt: null,
        now: new Date("2026-07-01T00:00:00Z"),
      }),
      false,
    );
  });

  it("is not editable after the deadline with no reopen", () => {
    assert.equal(
      isSubmissionEditable({
        collectionStatus: "CLOSED",
        submissionOpenAt: open,
        submissionDeadlineAt: deadline,
        lastReopenDeadlineAt: null,
        now: new Date("2026-07-29T00:00:00Z"),
      }),
      false,
    );
  });

  it("is editable after the deadline when an individual reopen window is active", () => {
    assert.equal(
      isSubmissionEditable({
        collectionStatus: "CLOSED",
        submissionOpenAt: open,
        submissionDeadlineAt: deadline,
        lastReopenDeadlineAt: new Date("2026-08-01T00:00:00Z"),
        now: new Date("2026-07-30T00:00:00Z"),
      }),
      true,
    );
  });

  it("is not editable once the reopen window itself expires", () => {
    assert.equal(
      isSubmissionEditable({
        collectionStatus: "CLOSED",
        submissionOpenAt: open,
        submissionDeadlineAt: deadline,
        lastReopenDeadlineAt: new Date("2026-08-01T00:00:00Z"),
        now: new Date("2026-08-02T00:00:00Z"),
      }),
      false,
    );
  });
});

describe("isLateSubmission", () => {
  it("is false before the deadline", () => {
    assert.equal(isLateSubmission(deadline, new Date("2026-07-25T00:00:00Z")), false);
  });

  it("is true after the deadline", () => {
    assert.equal(isLateSubmission(deadline, new Date("2026-08-01T00:00:00Z")), true);
  });
});
