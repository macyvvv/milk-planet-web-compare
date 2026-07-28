import { requireUser } from "@/lib/modules/auth/dal";
import { LogoutButton } from "@/app/components/logout-button";

export default async function HomePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">ようこそ</p>
          <h1 className="text-lg font-semibold">{user.displayName} さん</h1>
        </div>
        <LogoutButton />
      </header>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        出勤希望入力・確定シフト閲覧などの画面はPhase 3以降で実装予定です(WBS.md参照)。
      </p>
    </div>
  );
}
