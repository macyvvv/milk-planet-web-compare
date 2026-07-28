import Link from "next/link";
import { requireUser } from "@/lib/modules/auth/dal";
import { getAvailabilityScreenData } from "@/lib/modules/availability/availability.service";
import { toDateKey } from "@/lib/modules/periods/period-dates.ts";
import { formatBusinessTime } from "@/lib/modules/availability/business-time";
import { finalizeSubmitAction } from "../actions";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const STATUS_LABELS: Record<string, string> = {
  OFF: "休み",
  AVAILABLE: "出勤可能",
  PREFERRED: "出勤希望",
  TIME_NEGOTIABLE: "時間相談可",
};

export default async function AvailabilityConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ periodId?: string; storeId?: string }>;
}) {
  const user = await requireUser();
  const { periodId, storeId } = await searchParams;
  if (!periodId || !storeId) {
    return <p className="p-4 text-sm text-red-600">パラメータが不正です。</p>;
  }

  const data = await getAvailabilityScreenData(periodId, storeId, user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <header>
        <h1 className="text-lg font-semibold">提出内容の確認</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          内容を確認し、間違いなければ「提出する」を押してください。
        </p>
      </header>

      <ul className="flex flex-col gap-2">
        {data.dates.map((date) => {
          const key = toDateKey(date);
          const entry = data.entriesByDate.get(key);
          const status = entry?.availabilityStatus ?? "OFF";
          return (
            <li
              key={key}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
            >
              <span>
                {key.slice(5)}({DAY_LABELS[date.getUTCDay()]})
              </span>
              <span>
                {STATUS_LABELS[status] ?? status}
                {status !== "OFF" && entry?.start && entry?.end
                  ? ` ${formatBusinessTime(entry.start)}〜${formatBusinessTime(entry.end)}`
                  : ""}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-2">
        <Link
          href="/availability"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
        >
          修正する
        </Link>
        <form action={finalizeSubmitAction}>
          <input type="hidden" name="periodId" value={periodId} />
          <input type="hidden" name="storeId" value={storeId} />
          <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white">
            提出する
          </button>
        </form>
      </div>
    </div>
  );
}
