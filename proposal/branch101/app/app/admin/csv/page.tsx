import { requireRole, hasRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { listPeriods } from "@/lib/modules/periods/periods.service";
import { toDateKey } from "@/lib/modules/periods/period-dates.ts";
import { UploadCastsForm } from "./upload-casts-form";
import { UploadAvailabilityForm } from "./upload-availability-form";
import { UploadOperationalForm } from "./upload-operational-form";

const EXPORT_TYPES = [
  { type: "CASTS", label: "キャスト一覧", scoped: false },
  { type: "STORES", label: "店舗", scoped: false },
  { type: "PERIOD_CAST_TARGETS", label: "対象者・除外", scoped: false },
  { type: "NOTIFICATION_TEMPLATES", label: "通知テンプレート", scoped: false },
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

      {hasRole(user, Role.SUPER_USER) && (
        <section className="rounded-lg border border-sky-700 bg-sky-950/20 p-4">
          <h2 className="font-medium text-sky-300">初回導入</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
            <li>下の「管理データ一括登録・更新」で店舗CSVを登録</li>
            <li>「アカウント一括登録・更新」で利用者と4桁PINを登録</li>
            <li>必要に応じて所属、標準シフト、締切、イベント、確定シフトを登録</li>
            <li>アカウント反映直後に資格情報CSVをダウンロードして配布</li>
          </ol>
        </section>
      )}

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
          <h2 className="mb-2 font-medium">アカウント一括登録・更新</h2>
          <UploadCastsForm />
        </section>
      )}

      {hasRole(user, Role.SUPER_USER) && (
        <section>
          <h2 className="mb-2 font-medium">管理データ一括登録・更新</h2>
          <UploadOperationalForm />
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

export const metadata = {
  title: "CSV入出力 | Milk Planet",
};
