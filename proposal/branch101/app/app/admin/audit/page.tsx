import Link from "next/link";
import { requireRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";

/** REQ-AUDIT: 監査ログはSUPER_USER限定で閲覧のみ(更新・削除の導線は一切持たない)。 */
export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entityType?: string; page?: string }>;
}) {
  await requireRole(Role.SUPER_USER);
  const { action, entityType, page } = await searchParams;

  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const take = 50;
  const skip = (currentPage - 1) * take;

  const where = {
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
  };

  const [logs, totalCount] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.auditLog.count({ where }),
  ]);
  
  const totalPages = Math.ceil(totalCount / take);

  const entityTypes = await db.auditLog.findMany({
    distinct: ["entityType"],
    select: { entityType: true },
    take: 50,
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">管理ダッシュボード</p>
        <h1 className="text-lg font-semibold">監査ログ</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          追記専用です。更新・削除はSUPER_USERであっても行えません。
        </p>
      </header>

      <form className="flex flex-wrap items-center gap-2 text-sm" method="get">
        <select name="action" defaultValue={action ?? ""} className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
          <option value="">すべての操作</option>
          {Object.values(AUDIT_ACTIONS).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select name="entityType" defaultValue={entityType ?? ""} className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
          <option value="">すべての対象</option>
          {entityTypes.map((e) => (
            <option key={e.entityType} value={e.entityType}>
              {e.entityType}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-slate-300 px-3 py-1 dark:border-slate-700">
          絞り込み
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="p-1">日時</th>
              <th className="p-1">操作</th>
              <th className="p-1">対象</th>
              <th className="p-1">実行者</th>
              <th className="p-1">理由</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-slate-900">
                <td className="p-1">{log.createdAt.toISOString().slice(0, 19).replace("T", " ")}</td>
                <td className="p-1">{log.action}</td>
                <td className="p-1">
                  {log.entityType}
                  {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="p-1">{log.actorUserId ? log.actorUserId.slice(0, 8) : "system"}</td>
                <td className="p-1">{log.reason ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {totalCount} 件中 {(currentPage - 1) * take + 1} - {Math.min(currentPage * take, totalCount)} 件を表示
          </p>
          <div className="flex gap-2">
            <Link 
              href={`/admin/audit?action=${action ?? ""}&entityType=${entityType ?? ""}&page=${currentPage - 1}`}
              className={`px-3 py-1 text-sm rounded border ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
            >
              前へ
            </Link>
            <span className="px-3 py-1 text-sm">
              {currentPage} / {totalPages}
            </span>
            <Link 
              href={`/admin/audit?action=${action ?? ""}&entityType=${entityType ?? ""}&page=${currentPage + 1}`}
              className={`px-3 py-1 text-sm rounded border ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
            >
              次へ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "監査ログ | Milk Planet",
};
