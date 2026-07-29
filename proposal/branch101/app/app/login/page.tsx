"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 p-6 dark:border-slate-800"
      >
        <h1 className="text-lg font-semibold">ログイン</h1>

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
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">
            PIN（数字4桁）
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            inputMode="numeric"
            pattern="[0-9]{4}"
            minLength={4}
            maxLength={4}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-3 text-base dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-sky-600 px-4 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {pending ? "ログイン中…" : "ログイン"}
        </button>

        <div className="flex justify-between text-sm">
          <Link href="/initial-setup" className="text-sky-600 dark:text-sky-400">
            初めての方はこちら
          </Link>
          <Link href="/password-reset" className="text-sky-600 dark:text-sky-400">
            PINをお忘れの方
          </Link>
        </div>
      </form>
    </div>
  );
}
