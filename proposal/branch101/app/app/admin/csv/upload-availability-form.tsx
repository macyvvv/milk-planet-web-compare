"use client";

import { useActionState, useId } from "react";
import { uploadAvailabilityCsvAction, type CsvActionState } from "./import-actions";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

const initialState: CsvActionState = {};

export function UploadAvailabilityForm({
  periods,
  stores,
}: {
  periods: { id: string; label: string }[];
  stores: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(uploadAvailabilityCsvAction, initialState);
  const errorId = useId();

  return (
    <form action={formAction} className="flex flex-col gap-3 text-sm">
      <div className="text-slate-600 dark:text-slate-400">
        <p>列: login_name, target_date(YYYY-MM-DD), availability_status(OFF/AVAILABLE/PREFERRED/TIME_NEGOTIABLE), start_time(HH:MM, 最大30:00), end_time, note</p>
      </div>
      <p className="text-amber-700 dark:text-amber-400">
        緊急復旧・移行用のSUPER_USER限定操作です。キャスト本人の代理入力にあたるため、実行理由が必須です。
      </p>

      <div className="flex flex-wrap gap-2">
        <select name="periodId" required className="rounded-md border border-input px-3 py-1.5 bg-background">
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select name="storeId" required className="rounded-md border border-input px-3 py-1.5 bg-background">
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <input name="reason" placeholder="実行理由(必須)" required className="rounded-md border border-input px-3 py-1.5 bg-background" />
      <input 
        type="file" 
        name="file" 
        accept=".csv,text/csv" 
        required 
        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" 
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
        {pending ? "検証中…" : "アップロードして検証"}
      </Button>
    </form>
  );
}
