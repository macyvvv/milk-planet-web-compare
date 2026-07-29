"use client";

import { useActionState } from "react";
import { applyCastsCsvAction, type ApplyCastsState } from "../import-actions";

const initialState: ApplyCastsState = {};

export function ApplyCastsButton({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(applyCastsCsvAction, initialState);
  const downloadCredentials = () => {
    if (!state?.results) return;
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ["login_name", "display_name", "pin", "operation"],
      ...state.results.map((result) => [
        result.loginName,
        result.displayName,
        result.pin,
        result.operation,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "account-credentials.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

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
            PINはこの画面でのみ表示されます。資格情報CSVを保存して、安全に配布してください。
          </p>
          <button
            type="button"
            onClick={downloadCredentials}
            className="mb-2 rounded-md bg-amber-700 px-3 py-2 text-xs font-medium text-white"
          >
            資格情報CSVをダウンロード
          </button>
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="p-1">キャスト名</th>
                <th className="p-1">login_name</th>
                <th className="p-1">処理</th>
                <th className="p-1">PIN</th>
              </tr>
            </thead>
            <tbody>
              {state.results.map((r) => (
                <tr key={r.loginName}>
                  <td className="p-1">{r.displayName}</td>
                  <td className="p-1">{r.loginName}</td>
                  <td className="p-1">{r.operation}</td>
                  <td className="p-1 font-mono">{r.pin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
