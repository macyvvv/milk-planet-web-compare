import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">この操作を行う権限がありません</h1>
      <p className="text-slate-600 dark:text-slate-400">
        担当店舗またはロールの都合により、このページにはアクセスできません。
      </p>
      <Link href="/" className="text-sky-600 underline dark:text-sky-400">
        トップへ戻る
      </Link>
    </div>
  );
}
