"use client";

import { useActionState } from "react";
import { applyCastsCsvAction, type ApplyCastsState } from "../import-actions";

const initialState: ApplyCastsState = {};

export function ApplyCastsButton({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(applyCastsCsvAction, initialState);

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction}>
        <input type="hidden" name="jobId" value={jobId} />
        <button
          type="submit"
          disabled={pending || Boolean(state?.results)}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "反映中…" : state?.results ? "反映済み" : "この内容で反映する"}
        </button>
      </form>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      {state?.results && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950/30">
          <p className="mb-2 font-medium">
            初期設定コードはこの画面でのみ表示されます。今すぐ控えて、各キャストへ直接お伝えください。
          </p>
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="p-1">キャスト名</th>
                <th className="p-1">login_name</th>
                <th className="p-1">初期設定コード</th>
              </tr>
            </thead>
            <tbody>
              {state.results.map((r) => (
                <tr key={r.loginName}>
                  <td className="p-1">{r.displayName}</td>
                  <td className="p-1">{r.loginName}</td>
                  <td className="p-1 font-mono">{r.setupCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
