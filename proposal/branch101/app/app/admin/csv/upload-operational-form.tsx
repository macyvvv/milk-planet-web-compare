"use client";

import { useActionState, useState, useId } from "react";
import { uploadOperationalCsvAction, type CsvActionState } from "./import-actions";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

const initialState: CsvActionState = {};

const OPTIONS = [
  {
    value: "STORES",
    label: "店舗",
    columns: "operation, store_code, name, status",
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
      "operation, period_start_date, store_code, submission_open_at, submission_deadline_at",
  },
  {
    value: "PERIOD_CAST_TARGETS",
    label: "ピリオド対象者・除外",
    columns:
      "operation, period_start_date, store_code, user_id, login_name, target_status, exclusion_reason",
  },
  {
    value: "NOTIFICATION_TEMPLATES",
    label: "通知テンプレート",
    columns: "operation, template_type, store_code, body",
  },
  {
    value: "MEMBERSHIPS",
    label: "店舗所属・異動",
    columns: "operation, login_name, store_code, valid_from, valid_to, membership_type",
  },
  {
    value: "EVENTS",
    label: "イベント",
    columns: "operation, event_id, name, event_date, is_all_stores, store_codes, cast_note, admin_note, change_reason",
  },
  {
    value: "CONFIRMED_SHIFTS",
    label: "確定シフト",
    columns:
      "operation, login_name, store_code, period_start_date, work_date, start_time, end_time, cast_note, admin_note, change_reason",
  },
] as const;

export function UploadOperationalForm() {
  const [state, formAction, pending] = useActionState(uploadOperationalCsvAction, initialState);
  const [kind, setKind] = useState<(typeof OPTIONS)[number]["value"]>("STORES");
  const errorId = useId();

  return (
    <form action={formAction} className="flex flex-col gap-3 text-sm">
      <select
        name="kind"
        required
        value={kind}
        onChange={(event) => setKind(event.target.value as typeof kind)}
        className="rounded-md border border-input p-2 bg-background max-w-full"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} — {option.columns}
          </option>
        ))}
      </select>
      <a
        href={`/admin/csv/templates/${kind.toLowerCase()}`}
        className="block w-fit text-primary underline-offset-4 hover:underline"
      >
        選択中のCSVテンプレートをダウンロード
      </a>
      <input 
        type="file" 
        name="file" 
        accept=".csv,text/csv" 
        required 
        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 block" 
        aria-describedby={state?.error ? errorId : undefined}
      />
      
      <div aria-live="polite" aria-atomic="true">
        {state?.error && (
          <Alert variant="destructive" id={errorId}>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </div>

      <Button 
        type="submit" 
        loading={pending}
        disabled={pending} 
        className="self-start"
      >
        {pending ? "アップロード・検証中…" : "アップロードして検証"}
      </Button>
    </form>
  );
}
