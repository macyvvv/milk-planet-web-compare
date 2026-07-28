"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/modules/auth/dal";
import { getRequestContext } from "@/lib/modules/auth/session";
import { AvailabilityStatus } from "@/app/generated/prisma/client";
import {
  saveDraftEntries,
  applyStandardShiftToPeriod,
  setAllOff,
  submitAvailability,
  type DraftEntryInput,
} from "@/lib/modules/availability/availability.service";

export interface AvailabilityFormState {
  error?: string;
}

const DayFieldsSchema = z.object({
  periodId: z.string().uuid(),
  storeId: z.string().uuid(),
});

function parseDayEntries(formData: FormData): DraftEntryInput[] {
  const dateKeys = formData.getAll("dateKey").map(String);
  return dateKeys.map((dateKey) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const targetDate = new Date(Date.UTC(y, m - 1, d));
    const status = String(formData.get(`entry_${dateKey}_status`)) as AvailabilityStatus;
    const startHour = formData.get(`entry_${dateKey}_start_hour`);
    const startMinute = formData.get(`entry_${dateKey}_start_minute`);
    const endHour = formData.get(`entry_${dateKey}_end_hour`);
    const endMinute = formData.get(`entry_${dateKey}_end_minute`);
    const note = String(formData.get(`entry_${dateKey}_note`) ?? "");

    return {
      targetDate,
      availabilityStatus: status,
      start:
        status !== AvailabilityStatus.OFF && startHour !== null && startMinute !== null
          ? { hour: Number(startHour), minute: Number(startMinute) }
          : null,
      end:
        status !== AvailabilityStatus.OFF && endHour !== null && endMinute !== null
          ? { hour: Number(endHour), minute: Number(endMinute) }
          : null,
      note,
    };
  });
}

export async function saveDraftAction(
  _prevState: AvailabilityFormState | undefined,
  formData: FormData,
): Promise<AvailabilityFormState> {
  const parsed = DayFieldsSchema.safeParse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  if (!parsed.success) return { error: "入力内容を確認してください。" };

  const user = await requireUser();
  const ctx = await getRequestContext();
  const entries = parseDayEntries(formData);

  try {
    await saveDraftEntries({
      periodId: parsed.data.periodId,
      storeId: parsed.data.storeId,
      userId: user.id,
      entries,
      ctx,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "保存に失敗しました。" };
  }

  revalidatePath("/availability");
  return {};
}

export async function applyStandardShiftAction(formData: FormData): Promise<void> {
  const parsed = DayFieldsSchema.parse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  const user = await requireUser();
  const ctx = await getRequestContext();
  await applyStandardShiftToPeriod(parsed.periodId, parsed.storeId, user.id, ctx);
  revalidatePath("/availability");
}

export async function setAllOffAction(formData: FormData): Promise<void> {
  const parsed = DayFieldsSchema.parse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  const user = await requireUser();
  const ctx = await getRequestContext();
  await setAllOff(parsed.periodId, parsed.storeId, user.id, ctx);
  revalidatePath("/availability");
}

/** 「内容を確認」ボタン: 現在のフォーム内容を保存してから確認画面へ遷移する(REQ-UI-006)。 */
export async function goToConfirmAction(formData: FormData): Promise<void> {
  const parsed = DayFieldsSchema.parse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  const user = await requireUser();
  const ctx = await getRequestContext();
  const entries = parseDayEntries(formData);

  await saveDraftEntries({
    periodId: parsed.periodId,
    storeId: parsed.storeId,
    userId: user.id,
    entries,
    ctx,
  });

  redirect(`/availability/confirm?periodId=${parsed.periodId}&storeId=${parsed.storeId}`);
}

/** 確認画面での最終「提出する」ボタン。内容はすでに保存済みなので提出処理のみ行う。 */
export async function finalizeSubmitAction(formData: FormData): Promise<void> {
  const parsed = DayFieldsSchema.parse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  const user = await requireUser();
  const ctx = await getRequestContext();

  await submitAvailability({
    periodId: parsed.periodId,
    storeId: parsed.storeId,
    userId: user.id,
    ctx,
  });

  redirect(`/availability/complete?periodId=${parsed.periodId}&storeId=${parsed.storeId}`);
}
