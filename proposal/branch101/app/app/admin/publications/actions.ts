"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStoreAccess } from "@/lib/modules/auth/dal";
import { getRequestContext } from "@/lib/modules/auth/session";
import { publishShifts, markPostPublicationChangeNotified } from "@/lib/modules/publication/publication.service";

export interface PublishFormState {
  error?: string;
}

const PublishSchema = z.object({ periodId: z.string().uuid(), storeId: z.string().uuid() });

export async function publishAction(
  _prevState: PublishFormState | undefined,
  formData: FormData,
): Promise<PublishFormState> {
  const parsed = PublishSchema.safeParse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  if (!parsed.success) return { error: "入力内容を確認してください。" };

  const user = await requireStoreAccess(parsed.data.storeId);
  const ctx = await getRequestContext();

  try {
    await publishShifts({ ...parsed.data, actorUserId: user.id, ctx });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "公開に失敗しました。" };
  }

  revalidatePath("/admin/publications");
  return {};
}

const MarkNotifiedSchema = z.object({ confirmedShiftVersionId: z.string().uuid(), storeId: z.string().uuid() });

export async function markNotifiedAction(formData: FormData): Promise<void> {
  const parsed = MarkNotifiedSchema.parse({
    confirmedShiftVersionId: formData.get("confirmedShiftVersionId"),
    storeId: formData.get("storeId"),
  });
  const user = await requireStoreAccess(parsed.storeId);
  await markPostPublicationChangeNotified({
    confirmedShiftVersionId: parsed.confirmedShiftVersionId,
    actorUserId: user.id,
  });
  revalidatePath("/admin/publications");
}
