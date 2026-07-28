// REQ-UNSUB-003,004: LINE文章生成の純粋ロジック(テンプレート適用のみ、送信は行わない)。
// DBやNext.js APIに触れないため単体テスト対象にできる。

export function formatPeriodLabel(startDate: Date): string {
  const month = startDate.getUTCMonth() + 1;
  const half = startDate.getUTCDate() <= 15 ? "前半" : "後半";
  return `${month}月${half}`;
}

export interface StoreUnsubmittedGroup {
  storeName: string;
  /** 五十音順ソート済みの表示名一覧。呼び出し側でソートしてから渡す。 */
  names: string[];
  deadlineLabel?: string;
}

export function buildStoreUnsubmittedText(periodLabel: string, group: StoreUnsubmittedGroup): string {
  const lines = [`【${group.storeName}】`, `${periodLabel}シフト未提出：${group.names.join("、")}`];
  if (group.deadlineLabel) lines.push(`提出期限：${group.deadlineLabel}`);
  return lines.join("\n");
}

/** REQ-UNSUB-004: 空の店舗は表示しない、余分な改行を増やさない、締切が異なれば各店舗分を表示。 */
export function buildAllStoresUnsubmittedText(
  periodLabel: string,
  groups: StoreUnsubmittedGroup[],
): string {
  const nonEmpty = groups.filter((g) => g.names.length > 0);
  const header = `【${periodLabel}シフト未提出者】`;

  if (nonEmpty.length === 0) {
    return `${header}\n\n該当者はいません。`;
  }

  const sameDeadline = nonEmpty.every((g) => g.deadlineLabel === nonEmpty[0].deadlineLabel);

  const sections = nonEmpty.map((g) => {
    const lines = [`■ ${g.storeName}`, g.names.join("、")];
    if (!sameDeadline && g.deadlineLabel) lines.push(`(締切: ${g.deadlineLabel})`);
    return lines.join("\n");
  });

  const body: string[] = [header, ""];
  sections.forEach((section, i) => {
    if (i > 0) body.push("");
    body.push(section);
  });

  if (sameDeadline && nonEmpty[0].deadlineLabel) {
    body.push("", `提出期限：${nonEmpty[0].deadlineLabel}`);
  } else if (!sameDeadline) {
    body.push("", "提出期限は各店舗の案内を確認してください。");
  }

  return body.join("\n");
}
