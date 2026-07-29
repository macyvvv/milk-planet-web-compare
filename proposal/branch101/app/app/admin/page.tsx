import { requireRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { LogoutButton } from "@/app/components/logout-button";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
          <h1 className="text-lg font-semibold">{user.displayName} さん</h1>
        </div>
        <LogoutButton />
      </header>

      <nav className="grid gap-2 sm:grid-cols-2">
        <Link className="rounded-lg border p-3" href="/admin/users">アカウント管理</Link>
        {user.roles.includes(Role.SUPER_USER) && (
          <Link className="rounded-lg border p-3" href="/admin/roles">ロール・管理店舗</Link>
        )}
      </nav>
    </div>
  );
}
