"use client";

import { useActionState } from "react";
import type { PublishFormState } from "./actions";

const initialState: PublishFormState = {};

export function PublishButton({
  action,
  periodId,
  storeId,
}: {
  action: (state: PublishFormState | undefined, formData: FormData) => Promise<PublishFormState>;
  periodId: string;
  storeId: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="periodId" value={periodId} />
      <input type="hidden" name="storeId" value={storeId} />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "公開中…" : "公開する / 再公開する"}
      </button>
      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
