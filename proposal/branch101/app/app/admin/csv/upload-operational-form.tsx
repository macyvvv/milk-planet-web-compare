"use client";

import { useActionState } from "react";
import { uploadOperationalCsvAction, type CsvActionState } from "./import-actions";

const initialState: CsvActionState = {};

const OPTIONS = [
  {
    value: "STORES",
    label: "店舗",
    columns: "operation, name, status",
  },
  {
    value: "STANDARD_SHIFTS",
    label: "標準シフト",
    columns: "operation, login_name, day_of_week, is_working, start_time, end_time, note",
  },
  {
    value: "PERIOD_SETTINGS",
    label: "ピリオド締切",
    columns:
      "operation, period_start_date, store_name, submission_open_at, submission_deadline_at",
  },
  {
    value: "MEMBERSHIPS",
    label: "店舗所属・異動",
    columns: "login_name, store_name, valid_from, valid_to, membership_type",
  },
  {
    value: "EVENTS",
    label: "イベント",
    columns: "name, event_date, is_all_stores, store_names, cast_note, admin_note",
  },
  {
    value: "CONFIRMED_SHIFTS",
    label: "確定シフト",
    columns:
      "login_name, store_name, period_start_date, work_date, start_time, end_time, cast_note, admin_note",
  },
] as const;

export function UploadOperationalForm() {
  const [state, formAction, pending] = useActionState(uploadOperationalCsvAction, initialState);
  return (
    <form action={formAction} className="space-y-2 text-sm">
      <select name="kind" required className="rounded-md border p-2 dark:bg-slate-900">
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} — {option.columns}
          </option>
        ))}
      </select>
      <input type="file" name="file" accept=".csv,text/csv" required className="block" />
      {state?.error && <p className="text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded-md bg-sky-600 px-4 py-2 text-white disabled:opacity-60">
        {pending ? "検証中…" : "アップロードして検証"}
      </button>
    </form>
  );
}
