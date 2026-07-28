import { logoutAction } from "@/app/logout/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400"
      >
        ログアウト
      </button>
    </form>
  );
}
