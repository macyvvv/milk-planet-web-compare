import Link from "next/link";
import { requireUser } from "@/lib/modules/auth/dal";
import { getCurrentPrimaryStore } from "@/lib/modules/memberships/memberships.service";
import { suggestPeriodForStore, listPeriods } from "@/lib/modules/periods/periods.service";
import { getAvailabilityScreenData } from "@/lib/modules/availability/availability.service";
import { toDateKey } from "@/lib/modules/periods/period-dates.ts";
import { AvailabilityForm, type DayInitial } from "./availability-form";

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ periodId?: string }>;
}) {
  const user = await requireUser();
  const { periodId: periodIdParam } = await searchParams;

  const membership = await getCurrentPrimaryStore(user.id);
  if (!membership) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          所属店舗が設定されていません。管理者にご確認ください。
        </p>
      </div>
    );
  }
  const storeId = membership.storeId;

  const suggested = await suggestPeriodForStore(storeId);
  const periods = await listPeriods();
  const periodId = periodIdParam || suggested?.periodId || periods[0]?.id;

  if (!periodId) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">対象のピリオドがありません。</p>
          <Link href="/home" className="text-sm text-sky-600 underline dark:text-sky-400">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  const data = await getAvailabilityScreenData(periodId, storeId, user.id);

  const initialDays: DayInitial[] = data.dates.map((date) => {
    const key = toDateKey(date);
    const entry = data.entriesByDate.get(key);
    return {
      dateKey: key,
      dayOfWeek: date.getUTCDay(),
      status: entry?.availabilityStatus ?? "OFF",
      startHour: entry?.start?.hour ?? 19,
      startMinute: entry?.start?.minute ?? 0,
      endHour: entry?.end?.hour ?? 25,
      endMinute: entry?.end?.minute ?? 0,
      note: entry?.note ?? "",
      eventNames: data.eventNamesByDate.get(key) ?? [],
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">{membership.store.name}</p>
          <Link href="/home" className="text-sm text-sky-600 underline dark:text-sky-400">
            ホームに戻る
          </Link>
        </div>
        <h1 className="text-lg font-semibold">出勤希望入力</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {toDateKey(data.dates[0])} 〜 {toDateKey(data.dates[data.dates.length - 1])} ・ 提出状況:{" "}
          {data.submission.headerStatus} ・ {data.editable ? "編集可能" : "現在は編集できません"}
        </p>
        <form className="mt-1 flex items-center gap-2 text-sm" method="get">
          <label htmlFor="periodId">ピリオド切替:</label>
          <select
            id="periodId"
            name="periodId"
            defaultValue={periodId}
            className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {toDateKey(p.startDate)} 〜 {toDateKey(p.endDate)}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700">
            切替
          </button>
        </form>
        <Link href="/standard-shift" className="text-sm text-sky-600 underline dark:text-sky-400">
          標準シフトを編集する
        </Link>
      </header>

      <AvailabilityForm
        periodId={periodId}
        storeId={storeId}
        initialDays={initialDays}
        editable={data.editable}
      />
    </div>
  );
}

export const metadata = {
  title: "シフト希望入力 | Milk Planet",
};
