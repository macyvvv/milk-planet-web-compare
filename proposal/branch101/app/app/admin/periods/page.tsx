import { requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { ensurePeriodsGenerated, listPeriods } from "@/lib/modules/periods/periods.service";
import {
  ensurePeriodsAction,
  confirmEventsAction,
  openCollectionAction,
  closeCollectionAction,
} from "./actions";
import { DeadlineForm } from "./deadline-form";

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtDateTime(d: Date | null): string {
  if (!d) return "未設定";
  return d.toISOString().slice(0, 16).replace("T", " ");
}

export default async function AdminPeriodsPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>;
}) {
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const scope = resolveStoreScope(user);
  const { storeId: storeIdParam } = await searchParams;

  const stores =
    scope === "ALL"
      ? await listActiveStores()
      : await db.store.findMany({ where: { id: { in: scope } }, orderBy: { name: "asc" } });

  const selectedStoreId = storeIdParam && stores.some((s) => s.id === storeIdParam)
    ? storeIdParam
    : stores[0]?.id;

  await ensurePeriodsGenerated();
  const periods = await listPeriods();

  const settingsByPeriod = selectedStoreId
    ? new Map(
        (
          await db.periodStoreSetting.findMany({ where: { storeId: selectedStoreId } })
        ).map((s) => [s.periodId, s]),
      )
    : new Map();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">ピリオド・締切管理</h1>
      </header>

      {stores.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">管理対象店舗がありません。</p>
      ) : (
        <>
          <form className="flex items-center gap-2" method="get">
            <label htmlFor="storeId" className="text-sm font-medium">
              店舗
            </label>
            <select
              id="storeId"
              name="storeId"
              defaultValue={selectedStoreId}
              className="rounded-md border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            >
              切替
            </button>
          </form>

          <form action={ensurePeriodsAction}>
            <button type="submit" className="text-sm text-sky-600 underline dark:text-sky-400">
              将来ピリオドを再生成
            </button>
          </form>

          <ul className="flex flex-col gap-4">
            {periods.map((period) => {
              const setting = selectedStoreId ? settingsByPeriod.get(period.id) : undefined;
              return (
                <li
                  key={period.id}
                  className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-medium">
                      {fmt(period.startDate)} 〜 {fmt(period.endDate)}
                    </h2>
                    <div className="flex gap-2 text-xs">
                      <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
                        受付: {setting?.collectionStatus ?? "PREPARING"}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
                        調整: {setting?.schedulingStatus ?? "NOT_STARTED"}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
                        公開: {setting?.publicationStatus ?? "UNPUBLISHED"}
                      </span>
                    </div>
                  </div>

                  {selectedStoreId && (
                    <div className="mt-3 flex flex-col gap-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        受付開始: {fmtDateTime(setting?.submissionOpenAt ?? null)} / 締切:{" "}
                        {fmtDateTime(setting?.submissionDeadlineAt ?? null)} / イベント確認済み:{" "}
                        {setting?.eventsConfirmedAt ? "済" : "未"}
                      </p>

                      <DeadlineForm periodId={period.id} storeId={selectedStoreId} />

                      <div className="flex flex-wrap gap-2">
                        <form action={confirmEventsAction}>
                          <input type="hidden" name="periodId" value={period.id} />
                          <input type="hidden" name="storeId" value={selectedStoreId} />
                          <button
                            type="submit"
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs dark:border-slate-700"
                          >
                            イベント確認済みにする
                          </button>
                        </form>
                        <form action={openCollectionAction}>
                          <input type="hidden" name="periodId" value={period.id} />
                          <input type="hidden" name="storeId" value={selectedStoreId} />
                          <button
                            type="submit"
                            className="rounded-md bg-sky-600 px-3 py-2 text-xs text-white"
                          >
                            受付開始
                          </button>
                        </form>
                        <form action={closeCollectionAction}>
                          <input type="hidden" name="periodId" value={period.id} />
                          <input type="hidden" name="storeId" value={selectedStoreId} />
                          <button
                            type="submit"
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs dark:border-slate-700"
                          >
                            受付を締め切る
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
