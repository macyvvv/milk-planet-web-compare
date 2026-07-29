"use client";

import { useActionState } from "react";
import Link from "next/link";
import { completePasswordResetAction, type PasswordResetFormState } from "./actions";

const initialState: PasswordResetFormState = {};

export default function PasswordResetPage() {
  const [state, formAction, pending] = useActionState(completePasswordResetAction, initialState);

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 p-6 dark:border-slate-800"
      >
        <div>
          <h1 className="text-lg font-semibold">パスワード再設定</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            店長・副店長など管理者へ直接ご連絡ください。管理者が許可すると、一回限りの再設定コードが
            発行されます。そのコードとキャスト名を使って、新しいパスワードを設定してください。
          </p>
        </div>

        {state?.error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {state.error}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="loginName" className="block text-sm font-medium">
            キャスト名
          </label>
          <input
            id="loginName"
            name="loginName"
            autoComplete="username"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-base dark:border-slate-700 dark:bg-slate-900"
          />
          {state?.fieldErrors?.loginName && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.loginName}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="code" className="block text-sm font-medium">
            再設定コード
          </label>
          <input
            id="code"
            name="code"
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-base uppercase dark:border-slate-700 dark:bg-slate-900"
          />
          {state?.fieldErrors?.code && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.code}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="newPassword" className="block text-sm font-medium">
            新しいパスワード(10文字以上、英字と数字を含む)
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-base dark:border-slate-700 dark:bg-slate-900"
          />
          {state?.fieldErrors?.newPassword && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.fieldErrors.newPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-sky-600 px-4 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {pending ? "設定中…" : "パスワードを再設定してログイン"}
        </button>

        <Link href="/login" className="block text-center text-sm text-sky-600 dark:text-sky-400">
          ログイン画面に戻る
        </Link>
      </form>
    </div>
  );
}
