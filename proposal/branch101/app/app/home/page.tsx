import { requireUser, hasRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { LogoutButton } from "@/app/components/logout-button";

export default async function HomePage() {
  const user = await requireUser();

  const isAdmin = hasRole(
    user,
    Role.SUPER_USER,
    Role.AREA_MANAGER,
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">ようこそ</p>
          <h1 className="text-lg font-semibold">{user.displayName} さん</h1>
        </div>
        <LogoutButton />
      </header>

      <nav className="flex flex-col gap-3">
        <a
          href="/availability"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900"
        >
          <div>
            <div className="font-medium">出勤希望入力</div>
            <div className="text-sm text-slate-500">次回のシフト希望を提出します</div>
          </div>
          <span className="text-slate-400">→</span>
        </a>
        <a
          href="/my-shifts"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900"
        >
          <div>
            <div className="font-medium">確定シフト閲覧</div>
            <div className="text-sm text-slate-500">確定した自分のシフトを確認します</div>
          </div>
          <span className="text-slate-400">→</span>
        </a>
        <a
          href="/my-submissions"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900"
        >
          <div>
            <div className="font-medium">提出履歴</div>
            <div className="text-sm text-slate-500">過去のシフト提出履歴を確認します</div>
          </div>
          <span className="text-slate-400">→</span>
        </a>
      </nav>

      {isAdmin && (
        <div className="mt-8">
          <a
            href="/admin"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 shadow hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
          >
            管理者ダッシュボードへ
          </a>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "ホーム | Milk Planet",
};
