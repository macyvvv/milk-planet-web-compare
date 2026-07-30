import { requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { listPeriods } from "@/lib/modules/periods/periods.service";
import { listShiftDifferences } from "@/lib/modules/scheduling/scheduling.service";
import { toDateKey } from "@/lib/modules/periods/period-dates.ts";

const DIFF_LABELS: Record<string, string> = {
  OFF_BUT_SCHEDULED: "休み希望なのに配置",
  EARLIER_THAN_REQUESTED: "希望より早い開始",
  LATER_THAN_REQUESTED: "希望より遅い終了",
  SHORTER_THAN_REQUESTED: "希望より短縮",
  LONGER_THAN_REQUESTED: "希望より延長",
  STORE_DIFFERS_FROM_PRIMARY: "通常所属と異なる店舗",
  EVENT_CHANGED_AFTER_SUBMISSION: "提出後にイベント変更",
  DATE_ADDED_BY_ADMIN: "管理者が日付を追加",
  DATE_REMOVED_BY_ADMIN: "管理者が日付を削除",
};

export default async function AdminDifferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ periodId?: string; storeId?: string }>;
}) {
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const scope = resolveStoreScope(user);
  const { periodId: periodIdParam, storeId: storeIdParam } = await searchParams;

  const stores =
    scope === "ALL"
      ? await listActiveStores()
      : await db.store.findMany({ where: { id: { in: scope } }, orderBy: { name: "asc" } });
  const periods = await listPeriods();

  const storeId = storeIdParam && stores.some((s) => s.id === storeIdParam) ? storeIdParam : stores[0]?.id;
  const periodId = periodIdParam || periods[0]?.id;

  const rows = storeId && periodId ? await listShiftDifferences(periodId, storeId) : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">希望と確定の差分一覧</h1>
      </header>

      <form className="flex flex-wrap items-center gap-2 text-sm" method="get">
        <select name="storeId" defaultValue={storeId} className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="periodId" defaultValue={periodId} className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {toDateKey(p.startDate)} 〜
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-slate-300 px-3 py-1 dark:border-slate-700">
          切替
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">差分はありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-2">キャスト</th>
                <th className="p-2">日付</th>
                <th className="p-2">差分種別</th>
                <th className="p-2">変更理由</th>
                <th className="p-2">最終更新</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-900">
                  <td className="p-2">{row.displayName}</td>
                  <td className="p-2">{toDateKey(row.workDate)}</td>
                  <td className="p-2">{row.diffs.map((d) => DIFF_LABELS[d] ?? d).join("、")}</td>
                  <td className="p-2">{row.changeReason ?? "-"}</td>
                  <td className="p-2">{row.updatedAt ? row.updatedAt.toISOString().slice(0, 16).replace("T", " ") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "希望と確定の差分 | Milk Planet",
};
