"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/modules/auth/dal";
import { getRequestContext } from "@/lib/modules/auth/session";
import { saveStandardShift, type DayPattern } from "@/lib/modules/availability/standard-shift.service";

export interface StandardShiftFormState {
  error?: string;
  success?: boolean;
}

function readDay(formData: FormData, dayOfWeek: number): DayPattern {
  const isWorking = formData.get(`day_${dayOfWeek}_isWorking`) === "on";
  const startHour = formData.get(`day_${dayOfWeek}_start_hour`);
  const startMinute = formData.get(`day_${dayOfWeek}_start_minute`);
  const endHour = formData.get(`day_${dayOfWeek}_end_hour`);
  const endMinute = formData.get(`day_${dayOfWeek}_end_minute`);
  const note = String(formData.get(`day_${dayOfWeek}_note`) ?? "");

  return {
    dayOfWeek,
    isWorking,
    start:
      startHour !== null && startMinute !== null
        ? { hour: Number(startHour), minute: Number(startMinute) }
        : null,
    end:
      endHour !== null && endMinute !== null
        ? { hour: Number(endHour), minute: Number(endMinute) }
        : null,
    note,
  };
}

export async function saveStandardShiftAction(
  _prevState: StandardShiftFormState | undefined,
  formData: FormData,
): Promise<StandardShiftFormState> {
  const user = await requireUser();
  const ctx = await getRequestContext();

  const days = Array.from({ length: 7 }, (_, dayOfWeek) => readDay(formData, dayOfWeek));

  try {
    await saveStandardShift({ userId: user.id, days, ctx });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "保存に失敗しました。" };
  }

  revalidatePath("/standard-shift");
  return { success: true };
}
