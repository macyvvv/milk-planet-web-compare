import { requireRole, hasRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { listPeriods } from "@/lib/modules/periods/periods.service";
import { toDateKey } from "@/lib/modules/periods/period-dates.ts";
import { UploadCastsForm } from "./upload-casts-form";
import { UploadAvailabilityForm } from "./upload-availability-form";

const EXPORT_TYPES = [
  { type: "CASTS", label: "キャスト一覧", scoped: false },
  { type: "AVAILABILITY", label: "出勤希望", scoped: true },
  { type: "SUBMISSIONS", label: "提出状況", scoped: true },
  { type: "CONFIRMED_SHIFTS", label: "確定シフト", scoped: true },
  { type: "DIFFERENCES", label: "希望と確定の差分", scoped: true },
  { type: "EVENTS", label: "イベント", scoped: false },
  { type: "MEMBERSHIPS", label: "店舗所属履歴", scoped: false },
];

export default async function AdminCsvPage({
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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">CSV入出力</h1>
      </header>

      <section>
        <h2 className="mb-2 font-medium">エクスポート</h2>
        <form className="mb-2 flex flex-wrap items-center gap-2 text-sm" method="get">
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
        <ul className="flex flex-wrap gap-2 text-sm">
          {EXPORT_TYPES.map((e) => (
            <li key={e.type}>
              <a
                href={`/admin/csv/export?type=${e.type}${e.scoped ? `&periodId=${periodId}&storeId=${storeId}` : ""}`}
                className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700"
              >
                {e.label} CSV
              </a>
            </li>
          ))}
        </ul>
      </section>

      {hasRole(user, Role.AREA_MANAGER, Role.SUPER_USER) && (
        <section>
          <h2 className="mb-2 font-medium">キャスト一括登録(インポート)</h2>
          <UploadCastsForm />
        </section>
      )}

      {hasRole(user, Role.SUPER_USER) && (
        <section>
          <h2 className="mb-2 font-medium">出勤希望の緊急復旧インポート</h2>
          <UploadAvailabilityForm
            periods={periods.map((p) => ({ id: p.id, label: `${toDateKey(p.startDate)} 〜` }))}
            stores={stores}
          />
        </section>
      )}
    </div>
  );
}
