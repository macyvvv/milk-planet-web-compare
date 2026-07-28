"use client";

import { useActionState, useState } from "react";
import type { NotificationTextState } from "./actions";

type Action = (
  state: NotificationTextState | undefined,
  formData: FormData,
) => Promise<NotificationTextState>;

const initialState: NotificationTextState = {};

export function GenerateTextButton({
  action,
  hiddenFields,
  label,
}: {
  action: Action;
  hiddenFields: Record<string, string>;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!state?.text) return;
    await navigator.clipboard.writeText(state.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction}>
        {Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "生成中…" : label}
        </button>
      </form>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      {state?.text && (
        <div className="flex flex-col gap-2">
          <textarea
            readOnly
            value={state.text}
            rows={8}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="button"
            onClick={copy}
            className="self-start rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
          >
            {copied ? "コピーしました" : "クリップボードにコピー"}
          </button>
        </div>
      )}
    </div>
  );
}
