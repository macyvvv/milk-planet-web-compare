// REQ-AVAIL-005: input[type=time]だけに依存しない業務時刻入力(13:00〜30:00)。
// <select>を2つ組み合わせる方式にすることで、モバイルのネイティブピッカーでも
// 24:00超の値を確実に選べるようにする。

const HOURS = Array.from({ length: 31 }, (_, h) => h); // 0-30
const MINUTES = [0, 30];

export function BusinessTimeSelect({
  namePrefix,
  defaultHour,
  defaultMinute,
  disabled,
}: {
  namePrefix: string;
  defaultHour?: number;
  defaultMinute?: number;
  disabled?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <select
        name={`${namePrefix}_hour`}
        defaultValue={defaultHour}
        disabled={disabled}
        aria-label="時"
        className="rounded-md border border-slate-300 px-2 py-2 text-base dark:border-slate-700 dark:bg-slate-900"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, "0")}
          </option>
        ))}
      </select>
      <span aria-hidden="true">:</span>
      <select
        name={`${namePrefix}_minute`}
        defaultValue={defaultMinute}
        disabled={disabled}
        aria-label="分"
        className="rounded-md border border-slate-300 px-2 py-2 text-base dark:border-slate-700 dark:bg-slate-900"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
    </span>
  );
}
