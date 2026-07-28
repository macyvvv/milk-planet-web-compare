import { notFound } from "next/navigation";
import { requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { EventForm } from "../../event-form";

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const scope = resolveStoreScope(user);
  const { eventId } = await params;

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { stores: true },
  });
  if (!event) notFound();

  const stores =
    scope === "ALL"
      ? await listActiveStores()
      : await db.store.findMany({ where: { id: { in: scope } }, orderBy: { name: "asc" } });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">イベント編集</h1>
      </header>

      <EventForm
        stores={stores}
        mode="edit"
        defaults={{
          eventId: event.id,
          name: event.name,
          eventDate: toDateInputValue(event.eventDate),
          isAllStores: event.isAllStores,
          storeIds: event.stores.map((s) => s.storeId),
          castNote: event.castNote ?? "",
          adminNote: event.adminNote ?? "",
        }}
      />
    </div>
  );
}
