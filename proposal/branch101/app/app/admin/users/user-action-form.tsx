"use client";

import { useActionState } from "react";
import type { UserActionState } from "./actions";

export function UserActionForm({
  action,
  children,
}: {
  action: (
    state: UserActionState | undefined,
    formData: FormData,
  ) => Promise<UserActionState>;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-2">
      {children}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-sky-700 px-3 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "処理中…" : "実行"}
      </button>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.message && <p className="text-sm text-emerald-700">{state.message}</p>}
      {state?.setupCode && (
        <p className="rounded-md bg-amber-50 p-2 text-sm text-amber-900">
          一度だけ表示されるコード: <strong>{state.setupCode}</strong>
        </p>
      )}
    </form>
  );
}
