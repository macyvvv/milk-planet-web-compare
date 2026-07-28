import Link from "next/link";
import { requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { listPeriods } from "@/lib/modules/periods/periods.service";
import { getSchedulingDataByCast } from "@/lib/modules/scheduling/scheduling.service";
import { toDateKey } from "@/lib/modules/periods/period-dates.ts";
import { ShiftEditor } from "../shift-editor";

export default async function SchedulingByCastPage({
  searchParams,
}: {
  searchParams: Promise<{ periodId?: string; storeId?: string; userId?: string }>;
}) {
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const scope = resolveStoreScope(user);
  const { periodId: periodIdParam, storeId: storeIdParam, userId: userIdParam } = await searchParams;

  const stores =
    scope === "ALL"
      ? await listActiveStores()
      : await db.store.findMany({ where: { id: { in: scope } }, orderBy: { name: "asc" } });
  const periods = await listPeriods();

  const storeId = storeIdParam && stores.some((s) => s.id === storeIdParam) ? storeIdParam : stores[0]?.id;
  const periodId = periodIdParam || periods[0]?.id;

  const targets =
    storeId && periodId
      ? await db.periodCastTarget.findMany({
          where: { periodId, storeId, targetStatus: "ACTIVE" },
          include: { user: true },
          orderBy: [{ user: { displayNameKana: "asc" } }],
        })
      : [];
  const selectedUserId = userIdParam || targets[0]?.userId;

  const rows =
    storeId && periodId && selectedUserId
      ? await getSchedulingDataByCast(periodId, storeId, selectedUserId)
      : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
          <h1 className="text-lg font-semibold">確定シフト(キャスト別)</h1>
        </div>
        <Link href={`/admin/scheduling/by-date?periodId=${periodId}&storeId=${storeId}`} className="text-sm text-sky-600 underline dark:text-sky-400">
          日付別ビューへ
        </Link>
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
        <select name="userId" defaultValue={selectedUserId} className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
          {targets.map((t) => (
            <option key={t.userId} value={t.userId}>
              {t.user.displayName}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-slate-300 px-3 py-1 dark:border-slate-700">
          切替
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {rows.map((row) => {
          const dateKey = toDateKey(row.workDate);
          return (
            <li key={dateKey} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm">{dateKey}</span>
              <div className="flex-1">
                <ShiftEditor
                  periodId={periodId!}
                  storeId={storeId!}
                  userId={selectedUserId!}
                  workDateKey={dateKey}
                  availabilityStatus={row.entry?.availabilityStatus ?? null}
                  availabilityStart={row.entry?.startAt ?? null}
                  availabilityEnd={row.entry?.endAt ?? null}
                  confirmed={row.confirmedShift}
                  returnTo={`/admin/scheduling/by-cast?periodId=${periodId}&storeId=${storeId}&userId=${selectedUserId}`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
