import "server-only";
import { db } from "@/lib/db";
import { NotificationTemplateType } from "@/app/generated/prisma/client";

export interface SaveTemplateInput {
  templateType: NotificationTemplateType;
  storeId?: string | null;
  body: string;
  updatedById: string;
}

export async function getTemplate(
  templateType: NotificationTemplateType,
  storeId?: string | null
) {
  return db.notificationTemplate.findFirst({
    where: {
      templateType,
      storeId: storeId ?? null,
    },
  });
}

export async function saveTemplate(input: SaveTemplateInput) {
  const existing = await getTemplate(input.templateType, input.storeId);
  if (existing) {
    return db.notificationTemplate.update({
      where: { id: existing.id },
      data: {
        body: input.body,
        updatedById: input.updatedById,
      },
    });
  } else {
    return db.notificationTemplate.create({
      data: {
        templateType: input.templateType,
        storeId: input.storeId ?? null,
        body: input.body,
        updatedById: input.updatedById,
      },
    });
  }
}

export async function listTemplates(storeId?: string | null) {
  return db.notificationTemplate.findMany({
    where: {
      storeId: storeId ?? null,
    },
    orderBy: { templateType: "asc" },
  });
}
