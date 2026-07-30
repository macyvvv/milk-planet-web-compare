import { requireRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { listAllStores } from "@/lib/modules/stores/stores.service";
import { StoreForm } from "./store-form";

export default async function AdminStoresPage() {
  await requireRole(Role.SUPER_USER);

  const stores = await listAllStores();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
      <header className="border-b pb-4 flex justify-between items-end">
        <div>
          <p className="text-sm text-muted-foreground">管理ダッシュボード</p>
          <h1 className="text-2xl font-bold">店舗管理</h1>
        </div>
      </header>

      <section>
        <StoreForm />
      </section>

      <section className="mt-4">
        <h2 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-3">登録済み店舗一覧</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {stores.map((store) => (
            <div key={store.id}>
              <StoreForm store={{
                id: store.id,
                code: store.code,
                name: store.name,
                status: store.status
              }} />
            </div>
          ))}
          {stores.length === 0 && (
            <p className="text-muted-foreground text-sm">店舗が登録されていません。</p>
          )}
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: "店舗管理 | Milk Planet",
};
