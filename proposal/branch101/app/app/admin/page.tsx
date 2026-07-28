import { requireRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { LogoutButton } from "@/app/components/logout-button";

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

      <p className="text-sm text-slate-600 dark:text-slate-400">
        店舗・ピリオド別の進捗サマリーはPhase 2以降で実装予定です(WBS.md参照)。
      </p>
    </div>
  );
}
