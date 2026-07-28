"use client";

import { useActionState, useState } from "react";
import {
  saveDraftAction,
  applyStandardShiftAction,
  setAllOffAction,
  goToConfirmAction,
  type AvailabilityFormState,
} from "./actions";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const STATUS_LABELS: Record<string, string> = {
  OFF: "休み",
  AVAILABLE: "出勤可能",
  PREFERRED: "出勤希望",
  TIME_NEGOTIABLE: "時間相談可",
};
const HOURS = Array.from({ length: 31 }, (_, h) => h);
const MINUTES = [0, 30];

export interface DayInitial {
  dateKey: string; // yyyy-mm-dd
  dayOfWeek: number;
  status: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  note: string;
  eventNames: string[];
}

interface DayState {
  status: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  note: string;
}

const initialFormState: AvailabilityFormState = {};

export function AvailabilityForm({
  periodId,
  storeId,
  initialDays,
  editable,
}: {
  periodId: string;
  storeId: string;
  initialDays: DayInitial[];
  editable: boolean;
}) {
  const [saveState, saveFormAction, savePending] = useActionState(saveDraftAction, initialFormState);
  const [days, setDays] = useState<DayState[]>(
    initialDays.map((d) => ({
      status: d.status,
      startHour: d.startHour,
      startMinute: d.startMinute,
      endHour: d.endHour,
      endMinute: d.endMinute,
      note: d.note,
    })),
  );
  const [onlyUnfilled, setOnlyUnfilled] = useState(false);

  function updateDay(index: number, patch: Partial<DayState>) {
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function copyFromPreviousDay(index: number) {
    if (index === 0) return;
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index - 1] };
      return next;
    });
  }

  return (
    <form action={saveFormAction} className="flex flex-col gap-4">
      <input type="hidden" name="periodId" value={periodId} />
      <input type="hidden" name="storeId" value={storeId} />

      {saveState?.error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {saveState.error}
        </p>
      )}

      {editable && (
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="submit"
            formAction={applyStandardShiftAction}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700"
          >
            標準シフトを一括適用
          </button>
          <button
            type="submit"
            formAction={setAllOffAction}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700"
          >
            全日休みに設定
          </button>
          <label className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700">
            <input
              type="checkbox"
              checked={onlyUnfilled}
              onChange={(e) => setOnlyUnfilled(e.target.checked)}
            />
            未入力日のみ表示
          </label>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {initialDays.map((day, index) => {
          const state = days[index];
          const isUnfilled = !initialDays[index] || state.status === "" ;
          if (onlyUnfilled && !isUnfilled) return null;

          return (
            <div
              key={day.dateKey}
              className={`rounded-lg border p-3 ${
                day.eventNames.length > 0
                  ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <input type="hidden" name="dateKey" value={day.dateKey} />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {day.dateKey.slice(5)} ({DAY_LABELS[day.dayOfWeek]})
                </span>
                {day.eventNames.length > 0 && (
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    イベント: {day.eventNames.join("、")}
                  </span>
                )}
                {editable && index > 0 && (
                  <button
                    type="button"
                    onClick={() => copyFromPreviousDay(index)}
                    className="text-xs text-sky-600 underline dark:text-sky-400"
                  >
                    前日をコピー
                  </button>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  name={`entry_${day.dateKey}_status`}
                  value={state.status}
                  disabled={!editable}
                  onChange={(e) => updateDay(index, { status: e.target.value })}
                  className="rounded-md border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                {state.status !== "OFF" && (
                  <>
                    <select
                      name={`entry_${day.dateKey}_start_hour`}
                      value={state.startHour}
                      disabled={!editable}
                      onChange={(e) => updateDay(index, { startHour: Number(e.target.value) })}
                      className="rounded-md border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <select
                      name={`entry_${day.dateKey}_start_minute`}
                      value={state.startMinute}
                      disabled={!editable}
                      onChange={(e) => updateDay(index, { startMinute: Number(e.target.value) })}
                      className="rounded-md border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>
                          {String(m).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <span>〜</span>
                    <select
                      name={`entry_${day.dateKey}_end_hour`}
                      value={state.endHour}
                      disabled={!editable}
                      onChange={(e) => updateDay(index, { endHour: Number(e.target.value) })}
                      className="rounded-md border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <select
                      name={`entry_${day.dateKey}_end_minute`}
                      value={state.endMinute}
                      disabled={!editable}
                      onChange={(e) => updateDay(index, { endMinute: Number(e.target.value) })}
                      className="rounded-md border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>
                          {String(m).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              <input
                type="text"
                name={`entry_${day.dateKey}_note`}
                value={state.note}
                disabled={!editable}
                onChange={(e) => updateDay(index, { note: e.target.value })}
                placeholder="備考(任意)"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          );
        })}
      </div>

      {editable && (
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={savePending}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 disabled:opacity-60"
          >
            {savePending ? "保存中…" : "下書き保存"}
          </button>
          <button
            type="submit"
            formAction={goToConfirmAction}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white"
          >
            内容を確認して提出へ進む
          </button>
        </div>
      )}
    </form>
  );
}
