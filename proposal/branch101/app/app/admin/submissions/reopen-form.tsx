"use client";

import { useActionState } from "react";
import { reopenSubmissionAction, type ReopenFormState } from "./actions";

const initialState: ReopenFormState = {};

export function ReopenForm({ submissionId, storeId }: { submissionId: string; storeId: string }) {
  const [state, formAction, pending] = useActionState(reopenSubmissionAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-slate-200 pt-2 text-xs dark:border-slate-800">
      <input type="hidden" name="submissionId" value={submissionId} />
      <input type="hidden" name="storeId" value={storeId} />

      <div className="flex flex-col gap-1">
        <label htmlFor={`reopen-deadline-${submissionId}`}>再提出期限</label>
        <input
          id={`reopen-deadline-${submissionId}`}
          name="deadline"
          type="datetime-local"
          required
          className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`reopen-reason-${submissionId}`}>理由</label>
        <input
          id={`reopen-reason-${submissionId}`}
          name="reason"
          required
          className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-slate-300 px-3 py-1 dark:border-slate-700 disabled:opacity-60"
      >
        {pending ? "処理中…" : "個別受付再開"}
      </button>
      {state?.error && <p className="w-full text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
