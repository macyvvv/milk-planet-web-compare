import "server-only";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";
import { isValidBusinessTime, businessTimeToTotalMinutes, type BusinessTime } from "./business-time";

export interface DayPattern {
  dayOfWeek: number; // 0=Sun .. 6=Sat
  isWorking: boolean;
  start: BusinessTime | null;
  end: BusinessTime | null;
  note: string;
}

function minutesToBusinessTime(totalMinutes: number): BusinessTime {
  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 };
}

/** REQ-STDSHIFT-001: 曜日ごとの標準シフト。未登録の曜日は「休み」として返す。 */
export async function getStandardShift(userId: string): Promise<DayPattern[]> {
  const rows = await db.standardShiftPattern.findMany({ where: { userId } });
  const byDay = new Map(rows.map((r) => [r.dayOfWeek, r]));

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const row = byDay.get(dayOfWeek);
    return {
      dayOfWeek,
      isWorking: row?.isWorking ?? false,
      start: row?.startMinutes != null ? minutesToBusinessTime(row.startMinutes) : null,
      end: row?.endMinutes != null ? minutesToBusinessTime(row.endMinutes) : null,
      note: row?.note ?? "",
    };
  });
}

export interface SaveStandardShiftInput {
  userId: string;
  days: DayPattern[];
  ctx: RequestContext;
}

export async function saveStandardShift(input: SaveStandardShiftInput): Promise<void> {
  for (const day of input.days) {
    if (!day.isWorking) continue;
    if (!day.start || !day.end || !isValidBusinessTime(day.start) || !isValidBusinessTime(day.end)) {
      throw new Error(`${day.dayOfWeek}曜日: 出勤の場合は開始・終了時刻を正しく入力してください。`);
    }
    if (businessTimeToTotalMinutes(day.end) <= businessTimeToTotalMinutes(day.start)) {
      throw new Error(`${day.dayOfWeek}曜日: 終了時刻は開始時刻より後にしてください。`);
    }
  }

  await db.$transaction(async (tx) => {
    for (const day of input.days) {
      const startMinutes = day.isWorking && day.start ? businessTimeToTotalMinutes(day.start) : null;
      const endMinutes = day.isWorking && day.end ? businessTimeToTotalMinutes(day.end) : null;

      await tx.standardShiftPattern.upsert({
        where: { userId_dayOfWeek: { userId: input.userId, dayOfWeek: day.dayOfWeek } },
        create: {
          userId: input.userId,
          dayOfWeek: day.dayOfWeek,
          isWorking: day.isWorking,
          startMinutes,
          endMinutes,
          note: day.note || null,
        },
        update: { isWorking: day.isWorking, startMinutes, endMinutes, note: day.note || null },
      });
    }

    await recordAuditLog(
      {
        actorUserId: input.userId,
        action: AUDIT_ACTIONS.STANDARD_SHIFT_UPDATED,
        entityType: "StandardShiftPattern",
        entityId: input.userId,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );
  });
}
