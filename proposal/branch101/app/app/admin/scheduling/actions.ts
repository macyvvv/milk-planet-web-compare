"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStoreAccess } from "@/lib/modules/auth/dal";
import { getRequestContext } from "@/lib/modules/auth/session";
import { saveConfirmedShift, cancelConfirmedShift, confirmScheduling, OptimisticLockError } from "@/lib/modules/scheduling/scheduling.service";

export interface ShiftFormState {
  error?: string;
}

const SaveShiftSchema = z.object({
  periodId: z.string().uuid(),
  storeId: z.string().uuid(),
  userId: z.string().uuid(),
  workDate: z.string().min(1),
  startHour: z.coerce.number().min(0).max(30),
  startMinute: z.coerce.number(),
  endHour: z.coerce.number().min(0).max(30),
  endMinute: z.coerce.number(),
  adminNote: z.string().optional(),
  castNote: z.string().optional(),
  changeReason: z.string().optional(),
  expectedVersion: z.string().optional(),
  returnTo: z.string(),
});

export async function saveConfirmedShiftAction(
  _prevState: ShiftFormState | undefined,
  formData: FormData,
): Promise<ShiftFormState> {
  const parsed = SaveShiftSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };

  const user = await requireStoreAccess(parsed.data.storeId);
  const ctx = await getRequestContext();
  const [y, m, d] = parsed.data.workDate.split("-").map(Number);

  try {
    await saveConfirmedShift({
      periodId: parsed.data.periodId,
      storeId: parsed.data.storeId,
      userId: parsed.data.userId,
      workDate: new Date(Date.UTC(y, m - 1, d)),
      start: { hour: parsed.data.startHour, minute: parsed.data.startMinute },
      end: { hour: parsed.data.endHour, minute: parsed.data.endMinute },
      adminNote: parsed.data.adminNote,
      castNote: parsed.data.castNote,
      changeReason: parsed.data.changeReason,
      expectedVersion: parsed.data.expectedVersion ? Number(parsed.data.expectedVersion) : undefined,
      actorUserId: user.id,
      ctx,
    });
  } catch (error) {
    if (error instanceof OptimisticLockError) {
      return { error: error.message };
    }
    return { error: error instanceof Error ? error.message : "保存に失敗しました。" };
  }

  revalidatePath(parsed.data.returnTo);
  return {};
}

const CancelShiftSchema = z.object({
  confirmedShiftId: z.string().uuid(),
  storeId: z.string().uuid(),
  expectedVersion: z.coerce.number(),
  reason: z.string().min(1, "取消理由を入力してください"),
  returnTo: z.string(),
});

export async function cancelConfirmedShiftAction(
  _prevState: ShiftFormState | undefined,
  formData: FormData,
): Promise<ShiftFormState> {
  const parsed = CancelShiftSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };

  const user = await requireStoreAccess(parsed.data.storeId);
  const ctx = await getRequestContext();

  try {
    await cancelConfirmedShift({
      confirmedShiftId: parsed.data.confirmedShiftId,
      reason: parsed.data.reason,
      expectedVersion: parsed.data.expectedVersion,
      actorUserId: user.id,
      ctx,
    });
  } catch (error) {
    if (error instanceof OptimisticLockError) return { error: error.message };
    return { error: error instanceof Error ? error.message : "取消に失敗しました。" };
  }

  revalidatePath(parsed.data.returnTo);
  return {};
}

const ConfirmSchedulingSchema = z.object({ periodId: z.string().uuid(), storeId: z.string().uuid() });

export async function confirmSchedulingAction(formData: FormData): Promise<void> {
  const parsed = ConfirmSchedulingSchema.parse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  const user = await requireStoreAccess(parsed.storeId);
  const ctx = await getRequestContext();
  await confirmScheduling({ ...parsed, actorUserId: user.id, ctx });
  revalidatePath("/admin/scheduling/by-date");
}
