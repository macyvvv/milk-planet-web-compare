import Link from "next/link";
import { requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { disableEventAction } from "./actions";
import { EventForm } from "./event-form";

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AdminEventsPage() {
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const scope = resolveStoreScope(user);
  const stores =
    scope === "ALL"
      ? await listActiveStores()
      : await db.store.findMany({ where: { id: { in: scope } }, orderBy: { name: "asc" } });
  const storeIds = stores.map((s) => s.id);

  const events = await db.event.findMany({
    where:
      scope === "ALL"
        ? {}
        : { OR: [{ isAllStores: true }, { stores: { some: { storeId: { in: storeIds } } } }] },
    include: { stores: { include: { store: true } } },
    orderBy: { eventDate: "asc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">イベント管理</h1>
      </header>

      <section>
        <h2 className="mb-2 font-medium">新規イベント登録</h2>
        <EventForm stores={stores} mode="create" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">イベント一覧</h2>
        {events.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400">登録済みのイベントはありません。</p>
        )}
        <ul className="flex flex-col gap-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <div>
                <p className="font-medium">
                  {event.name}{" "}
                  {event.status === "DISABLED" && (
                    <span className="text-xs text-slate-400">(無効化済み)</span>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {fmt(event.eventDate)} ・{" "}
                  {event.isAllStores
                    ? "全店舗"
                    : event.stores.map((s) => s.store.name).join("、")}{" "}
                  ・ v{event.currentVersionNo}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-700"
                >
                  編集
                </Link>
                {event.status === "ACTIVE" && (
                  <form action={disableEventAction}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs dark:border-slate-700"
                    >
                      無効化
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
