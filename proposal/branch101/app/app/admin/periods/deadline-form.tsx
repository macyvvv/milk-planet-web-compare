"use client";

import { useActionState } from "react";
import { setDeadlineAction, type PeriodsActionState } from "./actions";

const initialState: PeriodsActionState = {};

export function DeadlineForm({ periodId, storeId }: { periodId: string; storeId: string }) {
  const [state, formAction, pending] = useActionState(setDeadlineAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="periodId" value={periodId} />
      <input type="hidden" name="storeId" value={storeId} />

      <div className="flex flex-col gap-1">
        <label htmlFor={`open-${periodId}`} className="text-xs font-medium">
          受付開始
        </label>
        <input
          id={`open-${periodId}`}
          name="submissionOpenAt"
          type="datetime-local"
          required
          className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`deadline-${periodId}`} className="text-xs font-medium">
          締切
        </label>
        <input
          id={`deadline-${periodId}`}
          name="submissionDeadlineAt"
          type="datetime-local"
          required
          className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-slate-300 px-3 py-2 text-xs dark:border-slate-700"
      >
        {pending ? "保存中…" : "締切を設定"}
      </button>

      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
