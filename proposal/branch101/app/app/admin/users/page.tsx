import { Role } from "@/app/generated/prisma/client";
import { hasRole, requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { db } from "@/lib/db";
import {
  approvePasswordResetAction,
  deactivateAccountAction,
  registerCastAction,
  reissueInitialSetupAction,
  unlockAccountAction,
} from "./actions";
import { UserActionForm } from "./user-action-form";
import { RegistrationFields } from "./registration-fields";
import { ResignationForm, MembershipForm } from "./user-management-forms";

export default async function AdminUsersPage() {
  const actor = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const scope = resolveStoreScope(actor);
  const stores = await db.store.findMany({
    where: {
      status: "ACTIVE",
      ...(scope === "ALL" ? {} : { id: { in: scope } }),
    },
    orderBy: { name: "asc" },
  });
  const users = await db.user.findMany({
    where:
      scope === "ALL"
        ? {}
        : { memberships: { some: { storeId: { in: scope }, validTo: null } } },
    include: {
      credential: true,
      rolesGranted: { where: { revokedAt: null } },
      memberships: { where: { validTo: null }, include: { store: true } },
      passwordSetupTokens: {
        where: { purpose: "PASSWORD_RESET", usedAt: null },
      }
    },
    orderBy: [{ displayNameKana: "asc" }, { displayName: "asc" }],
  });

  // PIN再設定申請が承認済み（resetRequest存在）のトークンを持つユーザーIDセット
  const pendingResetTokens = await db.passwordSetupToken.findMany({
    where: { purpose: "PASSWORD_RESET", usedAt: null },
    include: { resetRequest: true },
  });
  const pendingResetUserIds = new Set(
    pendingResetTokens.filter((t) => t.resetRequest !== null).map((t) => t.userId)
  );
  const isSuperUser = hasRole(actor, Role.SUPER_USER);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4">
      <header>
        <p className="text-sm text-slate-500">管理ダッシュボード</p>
        <h1 className="text-xl font-semibold">アカウント管理</h1>
      </header>

      <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="mb-1 font-medium">アカウント事前登録</h2>
        <p className="mb-3 text-sm text-slate-500">
          所属店舗と権限・役職をまとめて設定します。登録後に初期設定コードを本人へ渡してください。
        </p>
        <UserActionForm action={registerCastAction} submitLabel="事前登録する">
          <RegistrationFields stores={stores} canAssignElevatedRoles={isSuperUser} />
        </UserActionForm>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">登録済みアカウント</h2>
        {users.map((user) => (
          <article key={user.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  {user.displayName} <span className="text-sm text-slate-500">({user.loginName})</span>
                  {pendingResetUserIds.has(user.id) && (
                    <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                      PIN再設定申請中
                    </span>
                  )}
                </h3>
                <p className="text-sm text-slate-600">
                  {user.status} / {user.rolesGranted.map((role) => role.role).join(", ") || "ロールなし"}
                </p>
                <p className="text-sm text-slate-600">
                  {user.memberships.map((membership) => membership.store.name).join(", ") || "所属なし"}
                </p>
                {user.resignationScheduledOn && (
                  <p className="text-sm text-orange-600 font-medium mt-1">
                    退店予定: {user.resignationScheduledOn.toISOString().split("T")[0]}
                  </p>
                )}
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <MembershipForm 
                    userId={user.id} 
                    availableStores={stores} 
                    currentStoreIds={user.memberships.map(m => m.storeId)} 
                  />
                  <ResignationForm 
                    userId={user.id} 
                    currentResignationDate={user.resignationScheduledOn?.toISOString()} 
                  />
                </div>
              </div>
              {user.credential?.lockedUntil && user.credential.lockedUntil > new Date() && (
                <form action={unlockAccountAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button className="rounded-md border px-3 py-1 text-sm">ロック解除</button>
                </form>
              )}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <UserActionForm action={approvePasswordResetAction}>
                <input type="hidden" name="userId" value={user.id} />
                <input name="reason" placeholder="再設定理由（任意）" className="w-full rounded-md border p-2 text-sm dark:bg-slate-900" />
              </UserActionForm>
              {isSuperUser && user.status === "PENDING_SETUP" && (
                <UserActionForm action={reissueInitialSetupAction}>
                  <input type="hidden" name="userId" value={user.id} />
                </UserActionForm>
              )}
            </div>

            {isSuperUser && user.status !== "INACTIVE" && user.id !== actor.id && (
              <form action={deactivateAccountAction} className="mt-3 flex gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <input name="reason" required placeholder="無効化理由" className="rounded-md border p-2 text-sm dark:bg-slate-900" />
                <button className="rounded-md bg-red-700 px-3 py-2 text-sm text-white">無効化</button>
              </form>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

export const metadata = {
  title: "キャスト管理 | Milk Planet",
};
