"use server";
import { requireRole } from "@/lib/modules/auth/dal";
import { Role, NotificationTemplateType } from "@/app/generated/prisma/client";
import { saveTemplate } from "@/lib/modules/notifications/templates.service";
import { revalidatePath } from "next/cache";

export async function saveTemplateAction(formData: FormData) {
  const user = await requireRole(Role.AREA_MANAGER, Role.SUPER_USER);
  const templateType = formData.get("templateType") as NotificationTemplateType;
  const storeId = formData.get("storeId") as string | null;
  const body = formData.get("body") as string;

  if (!templateType || !body) {
    throw new Error("Missing required fields");
  }

  await saveTemplate({
    templateType,
    storeId: storeId ? storeId : null,
    body,
    updatedById: user.id,
  });

  revalidatePath("/app/admin/notification-templates");
}
