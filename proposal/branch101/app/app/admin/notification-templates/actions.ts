"use server";
import { requireRole } from "@/lib/modules/auth/dal";
import { Role, NotificationTemplateType } from "@/app/generated/prisma/client";
import { saveTemplate } from "@/lib/modules/notifications/templates.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface TemplateFormState {
  error?: string;
  success?: string;
}

const TemplateSchema = z.object({
  templateType: z.nativeEnum(NotificationTemplateType),
  storeId: z.string().optional(),
  body: z.string().min(1, "本文を入力してください"),
});

export async function saveTemplateAction(
  _prevState: TemplateFormState | undefined,
  formData: FormData
): Promise<TemplateFormState> {
  const user = await requireRole(Role.AREA_MANAGER, Role.SUPER_USER);
  
  const parsed = TemplateSchema.safeParse({
    templateType: formData.get("templateType"),
    storeId: formData.get("storeId") || undefined,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  try {
    await saveTemplate({
      templateType: parsed.data.templateType,
      storeId: parsed.data.storeId ?? null,
      body: parsed.data.body,
      updatedById: user.id,
    });
  } catch {
    return { error: "保存に失敗しました" };
  }

  revalidatePath("/admin/notification-templates");
  return { success: "保存しました" };
}
