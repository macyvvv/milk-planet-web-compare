import Link from "next/link";

export default function AvailabilityCompletePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-lg font-semibold">提出が完了しました</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        締切前であれば、出勤希望入力画面から内容を修正して再提出できます。
      </p>
      <div className="flex gap-2">
        <Link href="/availability" className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">
          出勤希望を見る
        </Link>
        <Link href="/home" className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white">
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
