import { requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { listActiveStores } from "@/lib/modules/stores/stores.service";
import { listPeriods } from "@/lib/modules/periods/periods.service";
import { ensureSubmissionsAction } from "./actions";
import { ReopenForm } from "./reopen-form";
import { ExclusionForm } from "./exclusion-form";

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "未着手",
  DRAFT: "下書き",
  SUBMITTED: "提出済み",
  LATE_SUBMITTED: "締切後提出",
  LOCKED: "編集不可(締切済み)",
};

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ periodId?: string; storeId?: string }>;
}) {
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const scope = resolveStoreScope(user);
  const { periodId: periodIdParam, storeId: storeIdParam } = await searchParams;

  const stores =
    scope === "ALL"
      ? await listActiveStores()
      : await db.store.findMany({ where: { id: { in: scope } }, orderBy: { name: "asc" } });
  const periods = await listPeriods();

  const selectedStoreId = storeIdParam && stores.some((s) => s.id === storeIdParam) ? storeIdParam : stores[0]?.id;
  const selectedPeriodId = periodIdParam || periods[0]?.id;

  const targets =
    selectedStoreId && selectedPeriodId
      ? await db.periodCastTarget.findMany({
          where: { periodId: selectedPeriodId, storeId: selectedStoreId },
          include: { user: true },
          orderBy: [{ user: { displayNameKana: "asc" } }, { user: { displayName: "asc" } }],
        })
      : [];

  const submissions =
    selectedStoreId && selectedPeriodId
      ? await db.availabilitySubmission.findMany({
          where: { periodId: selectedPeriodId, storeId: selectedStoreId },
        })
      : [];
  const submissionByUser = new Map(submissions.map((s) => [s.userId, s]));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">提出状況</h1>
      </header>

      <form className="flex flex-wrap items-center gap-2 text-sm" method="get">
        <label htmlFor="storeId">店舗</label>
        <select
          id="storeId"
          name="storeId"
          defaultValue={selectedStoreId}
          className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label htmlFor="periodId">ピリオド</label>
        <select
          id="periodId"
          name="periodId"
          defaultValue={selectedPeriodId}
          className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.startDate.toISOString().slice(0, 10)} 〜
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-slate-300 px-3 py-1 dark:border-slate-700">
          切替
        </button>
      </form>

      {selectedStoreId && selectedPeriodId && (
        <form action={ensureSubmissionsAction}>
          <input type="hidden" name="periodId" value={selectedPeriodId} />
          <input type="hidden" name="storeId" value={selectedStoreId} />
          <button type="submit" className="text-sm text-sky-600 underline dark:text-sky-400">
            提出レコードを初期化(未着手分を明示表示)
          </button>
        </form>
      )}

      <ul className="flex flex-col gap-2">
        {targets.map((target) => {
          const submission = submissionByUser.get(target.userId);
          const status = submission?.headerStatus ?? "NOT_STARTED";
          return (
            <li
              key={target.userId}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{target.user.displayName}</span>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                  {STATUS_LABELS[status] ?? status}
                </span>
                {target.targetStatus !== "ACTIVE" && (
                  <span className="rounded bg-destructive/10 text-destructive px-2 py-1 text-xs">
                    {target.targetStatus}
                  </span>
                )}
                {submission?.submittedAt && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    提出日時: {submission.submittedAt.toISOString().slice(0, 16).replace("T", " ")}
                  </span>
                )}
              </div>
              
              <ExclusionForm 
                targetId={target.id}
                storeId={selectedStoreId}
                currentStatus={target.targetStatus}
                currentReason={target.exclusionReason}
              />
              
              {status === "LOCKED" && submission && (
                <ReopenForm submissionId={submission.id} storeId={selectedStoreId} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const metadata = {
  title: "シフト提出状況 | Milk Planet",
};
