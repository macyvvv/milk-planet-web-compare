"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole, requireStoreAccess, hasRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { getRequestContext } from "@/lib/modules/auth/session";
import { createEvent, updateEvent, disableEvent } from "@/lib/modules/events/events.service";

export interface EventFormState {
  error?: string;
}

const EventInputSchema = z.object({
  name: z.string().min(1, "イベント名を入力してください"),
  eventDate: z.string().min(1, "日付を入力してください"),
  isAllStores: z.coerce.boolean(),
  storeIds: z.array(z.string().uuid()).default([]),
  castNote: z.string().optional(),
  adminNote: z.string().optional(),
});

function parseEventForm(formData: FormData) {
  return EventInputSchema.safeParse({
    name: formData.get("name"),
    eventDate: formData.get("eventDate"),
    isAllStores: formData.get("isAllStores") === "on",
    storeIds: formData.getAll("storeIds"),
    castNote: formData.get("castNote") || undefined,
    adminNote: formData.get("adminNote") || undefined,
  });
}

async function requireEventScope(isAllStores: boolean, storeIds: string[]) {
  if (isAllStores) {
    return requireRole(Role.AREA_MANAGER, Role.SUPER_USER);
  }
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  // Store managers may only touch events that include a store they manage.
  if (!hasRole(user, Role.AREA_MANAGER, Role.SUPER_USER)) {
    for (const storeId of storeIds) {
      await requireStoreAccess(storeId);
    }
  }
  return user;
}

export async function createEventAction(
  _prevState: EventFormState | undefined,
  formData: FormData,
): Promise<EventFormState> {
  const parsed = parseEventForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  if (!parsed.data.isAllStores && parsed.data.storeIds.length === 0) {
    return { error: "対象店舗を1つ以上選択してください。" };
  }

  const user = await requireEventScope(parsed.data.isAllStores, parsed.data.storeIds);
  const ctx = await getRequestContext();

  await createEvent({
    name: parsed.data.name,
    eventDate: new Date(parsed.data.eventDate),
    isAllStores: parsed.data.isAllStores,
    storeIds: parsed.data.storeIds,
    castNote: parsed.data.castNote,
    adminNote: parsed.data.adminNote,
    actorUserId: user.id,
    ctx,
  });

  revalidatePath("/admin/events");
  return {};
}

const UpdateEventSchema = EventInputSchema.extend({
  eventId: z.string().uuid(),
  changeReason: z.string().optional(),
});

export async function updateEventAction(
  _prevState: EventFormState | undefined,
  formData: FormData,
): Promise<EventFormState> {
  const parsed = UpdateEventSchema.safeParse({
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    eventDate: formData.get("eventDate"),
    isAllStores: formData.get("isAllStores") === "on",
    storeIds: formData.getAll("storeIds"),
    castNote: formData.get("castNote") || undefined,
    adminNote: formData.get("adminNote") || undefined,
    changeReason: formData.get("changeReason") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  if (!parsed.data.isAllStores && parsed.data.storeIds.length === 0) {
    return { error: "対象店舗を1つ以上選択してください。" };
  }

  const user = await requireEventScope(parsed.data.isAllStores, parsed.data.storeIds);
  const ctx = await getRequestContext();

  await updateEvent({
    eventId: parsed.data.eventId,
    name: parsed.data.name,
    eventDate: new Date(parsed.data.eventDate),
    isAllStores: parsed.data.isAllStores,
    storeIds: parsed.data.storeIds,
    castNote: parsed.data.castNote,
    adminNote: parsed.data.adminNote,
    changeReason: parsed.data.changeReason,
    actorUserId: user.id,
    ctx,
  });

  revalidatePath("/admin/events");
  return {};
}

export async function disableEventAction(formData: FormData): Promise<void> {
  const eventId = z.string().uuid().parse(formData.get("eventId"));
  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
  const ctx = await getRequestContext();
  await disableEvent({ eventId, actorUserId: user.id, ctx });
  revalidatePath("/admin/events");
}
