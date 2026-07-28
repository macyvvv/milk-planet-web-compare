"use client";

import { useActionState, useState } from "react";
import { createEventAction, updateEventAction, type EventFormState } from "./actions";

const initialState: EventFormState = {};

export interface EventFormProps {
  stores: { id: string; name: string }[];
  mode: "create" | "edit";
  defaults?: {
    eventId: string;
    name: string;
    eventDate: string; // yyyy-mm-dd
    isAllStores: boolean;
    storeIds: string[];
    castNote: string;
    adminNote: string;
  };
}

export function EventForm({ stores, mode, defaults }: EventFormProps) {
  const action = mode === "create" ? createEventAction : updateEventAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [isAllStores, setIsAllStores] = useState(defaults?.isAllStores ?? false);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      {mode === "edit" && defaults && (
        <input type="hidden" name="eventId" value={defaults.eventId} />
      )}

      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">
          イベント名
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaults?.name}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="eventDate" className="block text-sm font-medium">
          日付
        </label>
        <input
          id="eventDate"
          name="eventDate"
          type="date"
          required
          defaultValue={defaults?.eventDate}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isAllStores"
          checked={isAllStores}
          onChange={(e) => setIsAllStores(e.target.checked)}
        />
        全店舗イベント
      </label>

      {!isAllStores && (
        <fieldset className="space-y-1">
          <legend className="text-sm font-medium">対象店舗</legend>
          <div className="flex flex-wrap gap-3">
            {stores.map((s) => (
              <label key={s.id} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  name="storeIds"
                  value={s.id}
                  defaultChecked={defaults?.storeIds.includes(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="space-y-1">
        <label htmlFor="castNote" className="block text-sm font-medium">
          キャスト向け備考
        </label>
        <textarea
          id="castNote"
          name="castNote"
          rows={2}
          defaultValue={defaults?.castNote}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="adminNote" className="block text-sm font-medium">
          管理者向け備考
        </label>
        <textarea
          id="adminNote"
          name="adminNote"
          rows={2}
          defaultValue={defaults?.adminNote}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {mode === "edit" && (
        <div className="space-y-1">
          <label htmlFor="changeReason" className="block text-sm font-medium">
            変更理由(任意)
          </label>
          <input
            id="changeReason"
            name="changeReason"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "保存中…" : mode === "create" ? "イベントを登録" : "変更を保存"}
      </button>
    </form>
  );
}
