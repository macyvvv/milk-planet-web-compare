"use client";

import { useActionState, useState } from "react";
import { saveConfirmedShiftAction, cancelConfirmedShiftAction, type ShiftFormState } from "./actions";

const HOURS = Array.from({ length: 31 }, (_, h) => h);
const MINUTES = [0, 30];

const STATUS_LABELS: Record<string, string> = {
  OFF: "休み希望",
  AVAILABLE: "出勤可能",
  PREFERRED: "出勤希望",
  TIME_NEGOTIABLE: "時間相談可",
};

function fmtTime(d: Date | null): string {
  if (!d) return "-";
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

const initialState: ShiftFormState = {};

export interface ShiftEditorProps {
  periodId: string;
  storeId: string;
  userId: string;
  workDateKey: string; // yyyy-mm-dd
  availabilityStatus: string | null;
  availabilityStart: Date | null;
  availabilityEnd: Date | null;
  confirmed: {
    id: string;
    startAt: Date;
    endAt: Date;
    adminNote: string | null;
    castNote: string | null;
    version: number;
  } | null;
  returnTo: string;
}

export function ShiftEditor(props: ShiftEditorProps) {
  const [saveState, saveAction, savePending] = useActionState(saveConfirmedShiftAction, initialState);
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelConfirmedShiftAction, initialState);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-slate-200 p-2 text-xs dark:border-slate-800">
      <div className="flex items-center justify-between">
        <span>
          希望: {props.availabilityStatus ? STATUS_LABELS[props.availabilityStatus] ?? props.availabilityStatus : "未提出"}
          {props.availabilityStart && props.availabilityEnd
            ? ` ${fmtTime(props.availabilityStart)}〜${fmtTime(props.availabilityEnd)}`
            : ""}
        </span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-sky-600 underline dark:text-sky-400">
          {props.confirmed ? `確定: ${fmtTime(props.confirmed.startAt)}〜${fmtTime(props.confirmed.endAt)}` : "未配置"}
        </button>
      </div>

      {open && (
        <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-2 dark:border-slate-800">
          <form action={saveAction} className="flex flex-col gap-2">
            <input type="hidden" name="periodId" value={props.periodId} />
            <input type="hidden" name="storeId" value={props.storeId} />
            <input type="hidden" name="userId" value={props.userId} />
            <input type="hidden" name="workDate" value={props.workDateKey} />
            <input type="hidden" name="returnTo" value={props.returnTo} />
            {props.confirmed && (
              <input type="hidden" name="expectedVersion" value={props.confirmed.version} />
            )}

            <div className="flex flex-wrap items-center gap-1">
              <select
                name="startHour"
                defaultValue={props.confirmed ? props.confirmed.startAt.getUTCHours() : 19}
                className="rounded border border-slate-300 px-1 py-1 dark:border-slate-700 dark:bg-slate-900"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <select
                name="startMinute"
                defaultValue={props.confirmed ? props.confirmed.startAt.getUTCMinutes() : 0}
                className="rounded border border-slate-300 px-1 py-1 dark:border-slate-700 dark:bg-slate-900"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span>〜</span>
              <select
                name="endHour"
                defaultValue={props.confirmed ? props.confirmed.endAt.getUTCHours() : 25}
                className="rounded border border-slate-300 px-1 py-1 dark:border-slate-700 dark:bg-slate-900"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <select
                name="endMinute"
                defaultValue={props.confirmed ? props.confirmed.endAt.getUTCMinutes() : 0}
                className="rounded border border-slate-300 px-1 py-1 dark:border-slate-700 dark:bg-slate-900"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            <input
              name="adminNote"
              placeholder="管理者向け備考"
              defaultValue={props.confirmed?.adminNote ?? ""}
              className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              name="castNote"
              placeholder="キャスト向け備考"
              defaultValue={props.confirmed?.castNote ?? ""}
              className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              name="changeReason"
              placeholder="変更理由(希望外配置・大幅変更時は必須)"
              className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
            />

            {saveState?.error && <p className="text-red-600 dark:text-red-400">{saveState.error}</p>}

            <button
              type="submit"
              disabled={savePending}
              className="self-start rounded bg-sky-600 px-3 py-1 text-white disabled:opacity-60"
            >
              {savePending ? "保存中…" : "保存"}
            </button>
          </form>

          {props.confirmed && (
            <form action={cancelAction} className="flex items-center gap-2">
              <input type="hidden" name="confirmedShiftId" value={props.confirmed.id} />
              <input type="hidden" name="storeId" value={props.storeId} />
              <input type="hidden" name="expectedVersion" value={props.confirmed.version} />
              <input type="hidden" name="returnTo" value={props.returnTo} />
              <input
                name="reason"
                placeholder="取消理由"
                required
                className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
              />
              <button
                type="submit"
                disabled={cancelPending}
                className="rounded border border-red-300 px-3 py-1 text-red-600 dark:border-red-700 dark:text-red-400"
              >
                配置取消
              </button>
            </form>
          )}
          {cancelState?.error && <p className="text-red-600 dark:text-red-400">{cancelState.error}</p>}
        </div>
      )}
    </div>
  );
}
