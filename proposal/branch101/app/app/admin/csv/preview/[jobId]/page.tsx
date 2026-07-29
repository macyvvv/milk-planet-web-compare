import { notFound } from "next/navigation";
import { requireRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { applyAvailabilityCsvActionForm, applyOperationalCsvAction } from "../../import-actions";
import { ApplyCastsButton } from "../apply-casts-button";
import { csvRowData } from "@/lib/modules/csv/csv-utils";

export default async function CsvPreviewPage({ params }: { params: Promise<{ jobId: string }> }) {
  await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const { jobId } = await params;

  const job = await db.csvImportJob.findUnique({
    where: { id: jobId },
    include: { rows: { orderBy: { rowNo: "asc" } } },
  });
  if (!job) notFound();

  const invalidCount = job.rows.filter((r) => r.status === "INVALID").length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">CSVインポート プレビュー</h1>
      </header>

      <p className="text-sm">
        種別: {job.jobType} ・ 状態: {job.status} ・ 行数: {job.rows.length} ・ 無効行: {invalidCount}
      </p>
      {job.errorSummary && <p className="text-sm text-red-600 dark:text-red-400">{job.errorSummary}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="p-1">#</th>
              <th className="p-1">状態</th>
              <th className="p-1">内容</th>
              <th className="p-1">エラー</th>
            </tr>
          </thead>
          <tbody>
            {job.rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 dark:border-slate-900">
                <td className="p-1">{row.rowNo}</td>
                <td className="p-1">{row.status}</td>
                <td className="p-1">{JSON.stringify(csvRowData(row.rawData))}</td>
                <td className="p-1 text-red-600 dark:text-red-400">
                  {row.validationErrors
                    ? csvRowData<string[]>(row.validationErrors).join(" / ")
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {job.status === "PREVIEW_READY" && job.jobType === "CASTS" && <ApplyCastsButton jobId={job.id} />}

      {job.status === "PREVIEW_READY" && job.jobType === "AVAILABILITY" && (
        <form action={applyAvailabilityCsvActionForm}>
          <input type="hidden" name="jobId" value={job.id} />
          <button type="submit" className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white">
            この内容で反映する
          </button>
        </form>
      )}

      {job.status === "PREVIEW_READY" &&
        [
          "STORES",
          "MEMBERSHIPS",
          "STANDARD_SHIFTS",
          "PERIOD_SETTINGS",
          "EVENTS",
          "CONFIRMED_SHIFTS",
        ].includes(job.jobType) && (
          <form action={applyOperationalCsvAction}>
            <input type="hidden" name="jobId" value={job.id} />
            <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white">
              この内容で反映する
            </button>
          </form>
        )}

      {job.status === "APPLIED" && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          反映済みです({job.appliedAt?.toISOString().slice(0, 16).replace("T", " ")})。
        </p>
      )}
    </div>
  );
}
