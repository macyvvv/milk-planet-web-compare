import { requireUser } from "@/lib/modules/auth/dal";
import { listPublishedEntriesForCast } from "@/lib/modules/publication/publication.service";

export default async function MyShiftsPage() {
  const user = await requireUser();
  const entries = await listPublishedEntriesForCast(user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <header>
        <p className="text-sm text-slate-500 dark:text-slate-400">{user.displayName} さん</p>
        <h1 className="text-lg font-semibold">確定シフト(公開済み)</h1>
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">公開済みのシフトはまだありません。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => (
            <li key={e.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <p className="font-medium">
                {e.workDate.toISOString().slice(0, 10)} ・ {e.storeName}
              </p>
              <p>
                {e.startAt.toISOString().slice(11, 16)} 〜 {e.endAt.toISOString().slice(11, 16)}
              </p>
              {e.castNoteSnapshot && <p className="text-slate-500 dark:text-slate-400">備考: {e.castNoteSnapshot}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
