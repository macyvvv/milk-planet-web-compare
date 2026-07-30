import { requireUser } from "@/lib/modules/auth/dal";
import { getStandardShift } from "@/lib/modules/availability/standard-shift.service";
import { StandardShiftForm } from "./standard-shift-form";

export default async function StandardShiftPage() {
  const user = await requireUser();
  const days = await getStandardShift(user.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">{user.displayName} さん</p>
        <h1 className="text-lg font-semibold">標準シフト設定</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          曜日ごとの基本的な出勤パターンを登録します。出勤希望入力画面から一括適用できます。
        </p>
      </header>

      <StandardShiftForm initialDays={days} />
    </div>
  );
}

export const metadata = {
  title: "標準シフト | Milk Planet",
};
