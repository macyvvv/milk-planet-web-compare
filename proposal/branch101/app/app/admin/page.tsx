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
        {user.roles.includes(Role.SUPER_USER) && (
          <Link
            className="rounded-lg border border-sky-500 bg-sky-950/30 p-4"
            href="/admin/csv"
          >
            <span className="block font-medium text-sky-300">初回導入・一括更新（CSV）</span>
            <span className="mt-1 block text-sm text-slate-400">
              店舗と200人規模のアカウントをまとめて登録
            </span>
          </Link>
        )}
        <Link className="rounded-lg border p-3" href="/admin/users">アカウント管理</Link>
        {user.roles.includes(Role.SUPER_USER) && (
          <Link className="rounded-lg border p-3" href="/admin/roles">ロール・管理店舗</Link>
        )}
        <Link className="rounded-lg border p-3" href="/admin/csv">CSV入出力</Link>
      </nav>
    </div>
  );
}
