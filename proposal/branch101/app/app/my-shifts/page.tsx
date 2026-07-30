import { requireUser } from "@/lib/modules/auth/dal";
import { listPublishedEntriesForCast } from "@/lib/modules/publication/publication.service";
import { EmptyState } from "@/app/components/ui/empty-state";

export default async function MyShiftsPage() {
  const user = await requireUser();
  const entries = await listPublishedEntriesForCast(user.id);

  // Group by Month (YYYY-MM)
  const grouped = entries.reduce((acc, entry) => {
    const month = entry.workDate.toISOString().slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4">
      <header className="border-b pb-4">
        <p className="text-sm text-muted-foreground">{user.displayName} さん</p>
        <h1 className="text-2xl font-bold">確定シフト</h1>
      </header>

      {entries.length === 0 ? (
        <EmptyState
          title="確定シフトはありません"
          description="現在、公開されている確定シフトはありません。次のシフト公開をお待ちください。"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).sort().reverse().map(([month, monthEntries]) => (
            <section key={month}>
              <h2 className="mb-4 text-xl font-semibold border-l-4 border-primary pl-3">{month.replace("-", "年 ")}月</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {monthEntries.map((e) => (
                  <li key={e.id} className="flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">{e.workDate.toISOString().slice(8, 10)}日</span>
                        <span className="text-sm font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-md">{e.storeName}</span>
                      </div>
                      <p className="text-xl font-medium text-primary mb-2">
                        {e.startAt.toISOString().slice(11, 16)} <span className="text-muted-foreground font-normal text-sm mx-1">〜</span> {e.endAt.toISOString().slice(11, 16)}
                      </p>
                      {e.castNoteSnapshot && (
                        <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                          備考: {e.castNoteSnapshot}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "マイシフト | Milk Planet",
};
