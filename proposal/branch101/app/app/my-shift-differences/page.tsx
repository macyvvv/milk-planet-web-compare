import { requireUser } from "@/lib/modules/auth/dal";
import { listShiftDifferencesForCast } from "@/lib/modules/scheduling/scheduling.service";
import { toDateKey } from "@/lib/modules/periods/period-dates.ts";

const DIFF_LABELS: Record<string, string> = {
  OFF_BUT_SCHEDULED: "休み希望なのに配置",
  EARLIER_THAN_REQUESTED: "希望より早い開始",
  LATER_THAN_REQUESTED: "希望より遅い終了",
  SHORTER_THAN_REQUESTED: "希望より短縮",
  LONGER_THAN_REQUESTED: "希望より延長",
  STORE_DIFFERS_FROM_PRIMARY: "通常所属と異なる店舗",
  EVENT_CHANGED_AFTER_SUBMISSION: "提出後にイベント変更",
  DATE_ADDED_BY_ADMIN: "希望のなかった日に配置",
  DATE_REMOVED_BY_ADMIN: "配置取消",
};

export default async function MyShiftDifferencesPage() {
  const user = await requireUser();
  const rows = await listShiftDifferencesForCast(user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">{user.displayName} さん</p>
        <h1 className="text-lg font-semibold">希望との差分</h1>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">希望と異なる配置はありません。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <li key={i} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <p className="font-medium">{toDateKey(row.workDate)}</p>
              <p>{row.diffs.map((d) => DIFF_LABELS[d] ?? d).join("、")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
