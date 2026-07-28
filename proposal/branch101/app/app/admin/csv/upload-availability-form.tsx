"use client";

import { useActionState } from "react";
import { uploadAvailabilityCsvAction, type CsvActionState } from "./import-actions";

const initialState: CsvActionState = {};

export function UploadAvailabilityForm({
  periods,
  stores,
}: {
  periods: { id: string; label: string }[];
  stores: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(uploadAvailabilityCsvAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 text-sm">
      <p className="text-slate-600 dark:text-slate-400">
        列: login_name, target_date(YYYY-MM-DD), availability_status(OFF/AVAILABLE/PREFERRED/TIME_NEGOTIABLE),
        start_time(HH:MM, 最大30:00), end_time, note
      </p>
      <p className="text-amber-700 dark:text-amber-400">
        緊急復旧・移行用のSUPER_USER限定操作です。キャスト本人の代理入力にあたるため、実行理由が必須です。
      </p>

      <div className="flex flex-wrap gap-2">
        <select name="periodId" required className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select name="storeId" required className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <input name="reason" placeholder="実行理由(必須)" required className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900" />
      <input type="file" name="file" accept=".csv,text/csv" required className="text-sm" />

      {state?.error && <p className="text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "検証中…" : "アップロードして検証"}
      </button>
    </form>
  );
}
