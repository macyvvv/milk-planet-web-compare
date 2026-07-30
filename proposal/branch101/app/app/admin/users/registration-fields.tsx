"use client";

import { useState } from "react";
import {
  REGISTRATION_ROLE_LABELS,
  registrationNeedsManagerStores,
  type RegistrationRole,
} from "@/lib/modules/users/registration-policy";

export function RegistrationFields({
  stores,
  canAssignElevatedRoles,
}: {
  stores: { id: string; name: string }[];
  canAssignElevatedRoles: boolean;
}) {
  const [role, setRole] = useState<RegistrationRole>("CAST");
  const needsManagerStores = registrationNeedsManagerStores(role);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">ログイン名</span>
          <input name="loginName" required className="w-full rounded-md border p-2 dark:bg-slate-900" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">表示名</span>
          <input name="displayName" required className="w-full rounded-md border p-2 dark:bg-slate-900" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">読み仮名</span>
          <input name="displayNameKana" required className="w-full rounded-md border p-2 dark:bg-slate-900" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">所属店舗</span>
          <select name="storeId" required className="w-full rounded-md border p-2 dark:bg-slate-900">
            <option value="">所属店舗を選択</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </label>
      </div>

      {canAssignElevatedRoles ? (
        <label className="block space-y-1 text-sm">
          <span className="font-medium">権限・役職</span>
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as RegistrationRole)}
            className="w-full rounded-md border p-2 dark:bg-slate-900"
          >
            {(Object.entries(REGISTRATION_ROLE_LABELS) as [RegistrationRole, string][]).map(
              ([value, label]) => <option key={value} value={value}>{label}</option>,
            )}
          </select>
        </label>
      ) : (
        <input type="hidden" name="role" value="CAST" />
      )}

      {canAssignElevatedRoles && needsManagerStores && (
        <fieldset className="space-y-2 rounded-md border border-slate-200 p-3 dark:border-slate-800">
          <legend className="px-1 text-sm font-medium">管理対象店舗</legend>
          <p className="text-xs text-slate-500">所属店舗は自動的に管理対象へ含まれます。</p>
          <div className="flex flex-wrap gap-3">
            {stores.map((store) => (
              <label key={store.id} className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="managedStoreIds" value={store.id} />
                {store.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
