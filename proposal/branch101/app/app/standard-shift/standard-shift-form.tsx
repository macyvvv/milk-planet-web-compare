"use client";

import { useActionState, useState } from "react";
import { BusinessTimeSelect } from "@/app/components/business-time-select";
import { saveStandardShiftAction, type StandardShiftFormState } from "./actions";
import type { DayPattern } from "@/lib/modules/availability/standard-shift.service";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const initialState: StandardShiftFormState = {};

export function StandardShiftForm({ initialDays }: { initialDays: DayPattern[] }) {
  const [state, formAction, pending] = useActionState(saveStandardShiftAction, initialState);
  const [working, setWorking] = useState<boolean[]>(initialDays.map((d) => d.isWorking));

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          保存しました。
        </p>
      )}

      {initialDays.map((day) => (
        <div
          key={day.dayOfWeek}
          className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
        >
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              name={`day_${day.dayOfWeek}_isWorking`}
              defaultChecked={day.isWorking}
              onChange={(e) =>
                setWorking((prev) => {
                  const next = [...prev];
                  next[day.dayOfWeek] = e.target.checked;
                  return next;
                })
              }
            />
            {DAY_LABELS[day.dayOfWeek]}曜日
          </label>

          {working[day.dayOfWeek] && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <BusinessTimeSelect
                namePrefix={`day_${day.dayOfWeek}_start`}
                defaultHour={day.start?.hour ?? 19}
                defaultMinute={day.start?.minute ?? 0}
              />
              <span>〜</span>
              <BusinessTimeSelect
                namePrefix={`day_${day.dayOfWeek}_end`}
                defaultHour={day.end?.hour ?? 25}
                defaultMinute={day.end?.minute ?? 0}
              />
            </div>
          )}

          <input
            type="text"
            name={`day_${day.dayOfWeek}_note`}
            defaultValue={day.note}
            placeholder="備考(任意)"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "保存中…" : "保存"}
      </button>
    </form>
  );
}
