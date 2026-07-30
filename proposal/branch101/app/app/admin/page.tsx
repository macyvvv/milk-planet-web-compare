import { requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { LogoutButton } from "@/app/components/logout-button";
import Link from "next/link";
import { db } from "@/lib/db";
import { toDateKey } from "@/lib/modules/periods/period-dates.ts";

export default async function AdminDashboardPage() {
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const scope = resolveStoreScope(user);

  // 簡易な進捗サマリー情報の取得
  const latestPeriod = await db.period.findFirst({
    orderBy: { startDate: "desc" },
  });

  const submissionCount = latestPeriod
    ? await db.availabilitySubmission.count({
        where: {
          periodId: latestPeriod.id,
          storeId: scope === "ALL" ? undefined : { in: scope },
        },
      })
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <p className="text-sm text-muted-foreground">管理ダッシュボード</p>
          <h1 className="text-2xl font-bold">{user.displayName} さん</h1>
        </div>
        <LogoutButton />
      </header>

      {latestPeriod && (
        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">最新のシフト期間</h2>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">{toDateKey(latestPeriod.startDate)} 〜</p>
              <p className="text-sm text-muted-foreground mt-1">提出済み: {submissionCount} 件</p>
            </div>
            <Link 
              href="/admin/submissions" 
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              詳細を確認 →
            </Link>
          </div>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* シフト管理 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-2">シフト管理</h2>
          <nav className="flex flex-col gap-2">
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/submissions">提出状況確認</Link>
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/scheduling/by-date">シフト作成 (日付別)</Link>
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/scheduling/by-cast">シフト作成 (キャスト別)</Link>
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/unsubmitted">未提出者への連絡</Link>
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/publications">シフト公開</Link>
          </nav>
        </section>

        {/* 基本設定 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-2">基本設定</h2>
          <nav className="flex flex-col gap-2">
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/periods">シフト受付期間管理</Link>
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/events">イベント管理</Link>
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/notification-templates">通知テンプレート</Link>
          </nav>
        </section>

        {/* ユーザー・システム管理 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-2">システム・権限</h2>
          <nav className="flex flex-col gap-2">
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/users">アカウント管理</Link>
            {user.roles.includes(Role.SUPER_USER) && (
              <>
                <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/stores">店舗管理</Link>
                <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/roles">ロール・管理店舗</Link>
              </>
            )}
            <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/csv">CSV入出力</Link>
            {user.roles.includes(Role.SUPER_USER) && (
              <Link className="rounded-md border p-3 hover:bg-muted transition-colors" href="/admin/audit">監査ログ</Link>
            )}
          </nav>
        </section>
      </div>
    </div>
  );
}

export const metadata = {
  title: "管理ダッシュボード | Milk Planet",
};
