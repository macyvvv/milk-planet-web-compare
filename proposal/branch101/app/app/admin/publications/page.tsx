import { requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { listPeriods } from "@/lib/modules/periods/periods.service";
import {
  countUnpublishedPostPublicationChanges,
  listPostPublicationChanges,
} from "@/lib/modules/publication/publication.service";
import { toDateKey } from "@/lib/modules/periods/period-dates.ts";
import { publishAction, markNotifiedAction } from "./actions";
import { PublishButton } from "./publish-button";

export default async function AdminPublicationsPage({
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

  const setting =
    storeId && periodId
      ? await db.periodStoreSetting.findUnique({ where: { periodId_storeId: { periodId, storeId } } })
      : null;
  const publications =
    storeId && periodId
      ? await db.shiftPublication.findMany({
          where: { periodId, storeId },
          orderBy: { publicationNo: "desc" },
        })
      : [];
  const unnotifiedCount = storeId && periodId ? await countUnpublishedPostPublicationChanges(periodId, storeId) : 0;
  const postPubChanges = storeId && periodId ? await listPostPublicationChanges(periodId, storeId) : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">公開管理</h1>
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

      <p className="text-sm">
        調整状況: {setting?.schedulingStatus ?? "NOT_STARTED"} ・ 公開状況: {setting?.publicationStatus ?? "UNPUBLISHED"}
      </p>

      {storeId && periodId && <PublishButton action={publishAction} periodId={periodId} storeId={storeId} />}

      <section>
        <h2 className="mb-2 font-medium">公開履歴</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {publications.map((p) => (
            <li key={p.id}>
              第{p.publicationNo}回公開: {p.publishedAt.toISOString().slice(0, 16).replace("T", " ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-medium">
          公開後変更(未連絡: {unnotifiedCount}件)
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          {postPubChanges.map((c) => (
            <li key={c.id} className="rounded-md border border-slate-200 p-2 dark:border-slate-800">
              <p>
                {c.confirmedShift.user.displayName} ・ {toDateKey(c.workDate)} ・ 理由: {c.changeReason ?? "-"} ・
                連絡状態: {c.castNotifiedStatus}
              </p>
              {c.castNotifiedStatus === "NOT_NOTIFIED" && (
                <form action={markNotifiedAction}>
                  <input type="hidden" name="confirmedShiftVersionId" value={c.id} />
                  <input type="hidden" name="storeId" value={storeId} />
                  <button type="submit" className="text-xs text-sky-600 underline dark:text-sky-400">
                    連絡済みにする
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export const metadata = {
  title: "シフト公開 | Milk Planet",
};
