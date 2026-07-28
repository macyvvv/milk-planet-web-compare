"use server";

import { z } from "zod";
import { requireStoreAccess, requireRole, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import {
  generateStoreUnsubmittedText,
  generateAllStoresUnsubmittedText,
} from "@/lib/modules/notifications/unsubmitted.service";

export interface NotificationTextState {
  text?: string;
  error?: string;
}

const StoreSchema = z.object({ periodId: z.string().uuid(), storeId: z.string().uuid() });

export async function generateStoreTextAction(
  _prevState: NotificationTextState | undefined,
  formData: FormData,
): Promise<NotificationTextState> {
  const parsed = StoreSchema.safeParse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
  });
  if (!parsed.success) return { error: "入力内容を確認してください。" };

  const user = await requireStoreAccess(parsed.data.storeId);
  const text = await generateStoreUnsubmittedText({
    periodId: parsed.data.periodId,
    storeId: parsed.data.storeId,
    generatedById: user.id,
  });
  return { text };
}

const PeriodSchema = z.object({ periodId: z.string().uuid() });

export async function generateAllStoresTextAction(
  _prevState: NotificationTextState | undefined,
  formData: FormData,
): Promise<NotificationTextState> {
  const parsed = PeriodSchema.safeParse({ periodId: formData.get("periodId") });
  if (!parsed.success) return { error: "入力内容を確認してください。" };

  const user = await requireRole(Role.AREA_MANAGER, Role.SUPER_USER);
  const scope = resolveStoreScope(user);

  const { listActiveStores } = await import("@/lib/modules/stores/stores.service");
  const stores = scope === "ALL" ? await listActiveStores() : [];
  const storeIds = stores.map((s) => s.id);

  const text = await generateAllStoresUnsubmittedText({
    periodId: parsed.data.periodId,
    storeIds,
    generatedById: user.id,
  });
  return { text };
}
