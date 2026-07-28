"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStoreAccess } from "@/lib/modules/auth/dal";
import { getRequestContext } from "@/lib/modules/auth/session";
import { reopenSubmission } from "@/lib/modules/availability/availability.service";
import { db } from "@/lib/db";

export interface ReopenFormState {
  error?: string;
}

const ReopenSchema = z.object({
  submissionId: z.string().uuid(),
  storeId: z.string().uuid(),
  deadline: z.string().min(1, "再提出期限を入力してください"),
  reason: z.string().min(1, "理由を入力してください"),
});

export async function reopenSubmissionAction(
  _prevState: ReopenFormState | undefined,
  formData: FormData,
): Promise<ReopenFormState> {
  const parsed = ReopenSchema.safeParse({
    submissionId: formData.get("submissionId"),
    storeId: formData.get("storeId"),
    deadline: formData.get("deadline"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const user = await requireStoreAccess(parsed.data.storeId);
  const ctx = await getRequestContext();

  const deadline = new Date(parsed.data.deadline);
  if (deadline <= new Date()) {
    return { error: "再提出期限は未来の日時にしてください。" };
  }

  await reopenSubmission({
    submissionId: parsed.data.submissionId,
    deadline,
    reason: parsed.data.reason,
    actorUserId: user.id,
    ctx,
  });

  revalidatePath("/admin/submissions");
  return {};
}

export async function ensureSubmissionsAction(formData: FormData): Promise<void> {
  const periodId = z.string().uuid().parse(formData.get("periodId"));
  const storeId = z.string().uuid().parse(formData.get("storeId"));
  await requireStoreAccess(storeId);

  const targets = await db.periodCastTarget.findMany({
    where: { periodId, storeId, targetStatus: "ACTIVE" },
  });
  for (const target of targets) {
    await db.availabilitySubmission.upsert({
      where: { periodId_storeId_userId: { periodId, storeId, userId: target.userId } },
      create: { periodId, storeId, userId: target.userId },
      update: {},
    });
  }
  revalidatePath("/admin/submissions");
}
