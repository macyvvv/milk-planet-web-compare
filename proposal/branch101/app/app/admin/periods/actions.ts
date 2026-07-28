"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStoreAccess } from "@/lib/modules/auth/dal";
import { getRequestContext } from "@/lib/modules/auth/session";
import {
  setDeadline,
  confirmEventsForOpening,
  openCollection,
  closeCollection,
  ensurePeriodsGenerated,
} from "@/lib/modules/periods/periods.service";
import { generateCastTargets } from "@/lib/modules/periods/targets.service";

export interface PeriodsActionState {
  error?: string;
}

const SetDeadlineSchema = z.object({
  periodId: z.string().uuid(),
  storeId: z.string().uuid(),
  submissionOpenAt: z.string().min(1),
  submissionDeadlineAt: z.string().min(1),
});

export async function setDeadlineAction(
  _prevState: PeriodsActionState | undefined,
  formData: FormData,
): Promise<PeriodsActionState> {
  const parsed = SetDeadlineSchema.safeParse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
    submissionOpenAt: formData.get("submissionOpenAt"),
    submissionDeadlineAt: formData.get("submissionDeadlineAt"),
  });
  if (!parsed.success) return { error: "入力内容を確認してください。" };

  const user = await requireStoreAccess(parsed.data.storeId);
  const ctx = await getRequestContext();

  const openAt = new Date(parsed.data.submissionOpenAt);
  const deadlineAt = new Date(parsed.data.submissionDeadlineAt);
  if (deadlineAt <= openAt) {
    return { error: "締切日時は受付開始日時より後にしてください。" };
  }

  await setDeadline({
    periodId: parsed.data.periodId,
    storeId: parsed.data.storeId,
    submissionOpenAt: openAt,
    submissionDeadlineAt: deadlineAt,
    actorUserId: user.id,
    ctx,
  });

  revalidatePath("/admin/periods");
  return {};
}

const StorePeriodSchema = z.object({
  periodId: z.string().uuid(),
  storeId: z.string().uuid(),
});

export async function confirmEventsAction(formData: FormData): Promise<void> {
  const parsed = StorePeriodSchema.parse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  const user = await requireStoreAccess(parsed.storeId);
  const ctx = await getRequestContext();
  await confirmEventsForOpening({ ...parsed, actorUserId: user.id, ctx });
  revalidatePath("/admin/periods");
}

export async function openCollectionAction(formData: FormData): Promise<void> {
  const parsed = StorePeriodSchema.parse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  const user = await requireStoreAccess(parsed.storeId);
  const ctx = await getRequestContext();
  await generateCastTargets(parsed.periodId, parsed.storeId);
  await openCollection({ ...parsed, actorUserId: user.id, ctx });
  revalidatePath("/admin/periods");
}

export async function closeCollectionAction(formData: FormData): Promise<void> {
  const parsed = StorePeriodSchema.parse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  const user = await requireStoreAccess(parsed.storeId);
  const ctx = await getRequestContext();
  await closeCollection({ ...parsed, actorUserId: user.id, ctx });
  revalidatePath("/admin/periods");
}

export async function ensurePeriodsAction(): Promise<void> {
  await ensurePeriodsGenerated();
  revalidatePath("/admin/periods");
}
