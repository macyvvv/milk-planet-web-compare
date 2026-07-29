import { Role } from "@/app/generated/prisma/client";
import { requireRole } from "@/lib/modules/auth/dal";
import { db } from "@/lib/db";
import {
  grantRoleAction,
  replaceManagerScopesAction,
  revokeRoleAction,
} from "./actions";
import { PERMISSION_LABELS, permissionLevelForRoles } from "@/lib/modules/auth/permission-level";

export default async function AdminRolesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(Role.SUPER_USER);
  const { error } = await searchParams;
  const [users, stores] = await Promise.all([
    db.user.findMany({
      where: { status: { in: ["PENDING_SETUP", "ACTIVE"] } },
      include: {
        rolesGranted: { where: { revokedAt: null } },
        managerScopes: { where: { revokedAt: null } },
      },
      orderBy: [{ displayNameKana: "asc" }, { displayName: "asc" }],
    }),
    db.store.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4">
      <header>
        <p className="text-sm text-slate-500">管理ダッシュボード</p>
        <h1 className="text-xl font-semibold">ロール・管理店舗</h1>
      </header>
      {error && <p role="alert" className="rounded-md bg-red-950 p-3 text-sm text-red-300">{error}</p>}

      {users.map((user) => {
        const activeRoles = new Set(user.rolesGranted.map((grant) => grant.role));
        const activeScopes = new Set(user.managerScopes.map((scope) => scope.storeId));
        return (
          <article key={user.id} className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <h2 className="font-medium">{user.displayName} <span className="text-sm text-slate-500">({user.loginName})</span></h2>
              <p className="text-sm text-slate-600">
                権限: {PERMISSION_LABELS[permissionLevelForRoles(activeRoles)]}
                {" / "}役職: {[...activeRoles].join(", ") || "一般ユーザー"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.values(Role).map((role) => (
                <form key={role} action={activeRoles.has(role) ? revokeRoleAction : grantRoleAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="role" value={role} />
                  <button className={`rounded-md border px-3 py-1 text-sm ${activeRoles.has(role) ? "border-red-300 text-red-700" : ""}`}>
                    {activeRoles.has(role) ? `${role}を取消` : `${role}を付与`}
                  </button>
                </form>
              ))}
            </div>

            <form action={replaceManagerScopesAction} className="space-y-2">
              <input type="hidden" name="userId" value={user.id} />
              <fieldset>
                <legend className="text-sm font-medium">管理対象店舗</legend>
                <div className="flex flex-wrap gap-3">
                  {stores.map((store) => (
                    <label key={store.id} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        name="storeIds"
                        value={store.id}
                        defaultChecked={activeScopes.has(store.id)}
                      />
                      {store.name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button className="rounded-md bg-sky-700 px-3 py-2 text-sm text-white">管理店舗を保存</button>
            </form>
          </article>
        );
      })}
    </div>
  );
}
