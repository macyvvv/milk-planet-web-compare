// REQ-AVAIL-006,009,010: 締切前のみ本人が編集できる。個別再開中は締切後でも編集できる。
// state_transitions.md 2章。DBやNext.js APIに触れない純粋関数として独立させ、単体テスト対象にする。

export interface EditabilityInput {
  collectionStatus: "PREPARING" | "OPEN" | "CLOSED";
  submissionOpenAt: Date | null;
  submissionDeadlineAt: Date | null;
  lastReopenDeadlineAt: Date | null;
  now: Date;
}

export function isSubmissionEditable(input: EditabilityInput): boolean {
  const withinNormalWindow =
    input.collectionStatus === "OPEN" &&
    input.submissionOpenAt !== null &&
    input.submissionDeadlineAt !== null &&
    input.now >= input.submissionOpenAt &&
    input.now < input.submissionDeadlineAt;

  const withinReopenWindow =
    input.lastReopenDeadlineAt !== null && input.now < input.lastReopenDeadlineAt;

  return withinNormalWindow || withinReopenWindow;
}

/** REQ-AVAIL-007: 締切を過ぎての提出(個別再開中)は LATE_SUBMITTED として扱う。 */
export function isLateSubmission(submissionDeadlineAt: Date | null, now: Date): boolean {
  return submissionDeadlineAt !== null && now > submissionDeadlineAt;
}
