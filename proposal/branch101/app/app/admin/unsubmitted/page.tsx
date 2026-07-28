import { requireRole, resolveStoreScope, hasRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { listPeriods } from "@/lib/modules/periods/periods.service";
import { listUnsubmittedForStore } from "@/lib/modules/notifications/unsubmitted.service";
import { generateStoreTextAction, generateAllStoresTextAction } from "./actions";
import { GenerateTextButton } from "./generate-text-button";

export default async function AdminUnsubmittedPage({
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

  const selectedStoreId = storeIdParam && stores.some((s) => s.id === storeIdParam) ? storeIdParam : stores[0]?.id;
  const selectedPeriodId = periodIdParam || periods[0]?.id;

  const unsubmitted =
    selectedStoreId && selectedPeriodId
      ? await listUnsubmittedForStore(selectedPeriodId, selectedStoreId)
      : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">未提出者一覧・LINE文章生成</h1>
      </header>

      <form className="flex flex-wrap items-center gap-2 text-sm" method="get">
        <label htmlFor="storeId">店舗</label>
        <select
          id="storeId"
          name="storeId"
          defaultValue={selectedStoreId}
          className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label htmlFor="periodId">ピリオド</label>
        <select
          id="periodId"
          name="periodId"
          defaultValue={selectedPeriodId}
          className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.startDate.toISOString().slice(0, 10)} 〜
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-slate-300 px-3 py-1 dark:border-slate-700">
          切替
        </button>
      </form>

      <section>
        <h2 className="mb-2 font-medium">未提出者(五十音順)</h2>
        {unsubmitted.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">未提出者はいません。</p>
        ) : (
          <ul className="flex flex-wrap gap-2 text-sm">
            {unsubmitted.map((u) => (
              <li key={u.userId} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                {u.displayName}
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedStoreId && selectedPeriodId && (
        <section>
          <h2 className="mb-2 font-medium">店舗単位のLINE文章</h2>
          <GenerateTextButton
            action={generateStoreTextAction}
            hiddenFields={{ periodId: selectedPeriodId, storeId: selectedStoreId }}
            label="文章を生成"
          />
        </section>
      )}

      {hasRole(user, Role.AREA_MANAGER, Role.SUPER_USER) && selectedPeriodId && (
        <section>
          <h2 className="mb-2 font-medium">全店一斉のLINE文章</h2>
          <GenerateTextButton
            action={generateAllStoresTextAction}
            hiddenFields={{ periodId: selectedPeriodId }}
            label="全店一斉の文章を生成"
          />
        </section>
      )}
    </div>
  );
}
