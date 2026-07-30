import { requireUser } from "@/lib/modules/auth/dal";
import { db } from "@/lib/db";

export default async function MySubmissionsPage() {
  const user = await requireUser();

  const submissions = await db.availabilitySubmission.findMany({
    where: { userId: user.id },
    include: { period: true, versions: { orderBy: { versionNo: "desc" }, take: 1 } },
    orderBy: { period: { startDate: "desc" } },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">{user.displayName} さん</p>
        <h1 className="text-lg font-semibold">提出履歴</h1>
      </header>

      <ul className="flex flex-col gap-2">
        {submissions.map((s) => (
          <li key={s.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
            <p className="font-medium">
              {s.period.startDate.toISOString().slice(0, 10)} 〜 {s.period.endDate.toISOString().slice(0, 10)}
            </p>
            <p>
              状態: {s.headerStatus} ・ 提出日時:{" "}
              {s.submittedAt ? s.submittedAt.toISOString().slice(0, 16).replace("T", " ") : "-"} ・ 版数:{" "}
              {s.currentVersionNo}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const metadata = {
  title: "自分のシフト提出状況 | Milk Planet",
};
