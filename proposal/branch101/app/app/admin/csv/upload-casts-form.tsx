"use client";

import { useActionState } from "react";
import Link from "next/link";
import { uploadCastsCsvAction, type CsvActionState } from "./import-actions";

const initialState: CsvActionState = {};

export function UploadCastsForm() {
  const [state, formAction, pending] = useActionState(uploadCastsCsvAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 text-sm">
      <p className="text-slate-600 dark:text-slate-400">
        列: operation, user_id, login_name, display_name, display_name_kana, store_code, pin,
        permission_level, job_title, managed_store_codes, resignation_scheduled_on
      </p>
      <p className="text-slate-600 dark:text-slate-400">
        新規UPSERTのpin空欄は数字4桁を自動生成します。既存ユーザーの空欄は変更しません。
      </p>
      <Link href="/admin/csv/templates/casts" className="self-start text-sky-600 underline">
        アカウントCSVテンプレートをダウンロード
      </Link>
      <input type="file" name="file" accept=".csv,text/csv" required className="text-sm" />
      {state?.error && <p className="text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "検証中…" : "アップロードして検証"}
      </button>
    </form>
  );
}
