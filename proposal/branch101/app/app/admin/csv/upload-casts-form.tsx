"use client";

import { useActionState, useId } from "react";
import Link from "next/link";
import { uploadCastsCsvAction, type CsvActionState } from "./import-actions";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

const initialState: CsvActionState = {};

export function UploadCastsForm() {
  const [state, formAction, pending] = useActionState(uploadCastsCsvAction, initialState);
  const errorId = useId();

  return (
    <form action={formAction} className="flex flex-col gap-3 text-sm">
      <div className="text-slate-600 dark:text-slate-400">
        <p>列: operation, user_id, login_name, display_name, display_name_kana, store_code, pin, permission_level, job_title, managed_store_codes, resignation_scheduled_on</p>
        <p>新規UPSERTのpin空欄は数字4桁を自動生成します。既存ユーザーの空欄は変更しません。</p>
      </div>
      <Link href="/admin/csv/templates/casts" className="self-start text-primary underline-offset-4 hover:underline">
        アカウントCSVテンプレートをダウンロード
      </Link>
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
        {pending ? "アップロード・検証中…" : "アップロードして検証"}
      </Button>
    </form>
  );
}
