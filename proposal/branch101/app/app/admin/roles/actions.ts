"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Role } from "@/app/generated/prisma/client";
import { requireRole } from "@/lib/modules/auth/dal";
import { getRequestContext } from "@/lib/modules/auth/session";
import {
  grantRole,
  replaceManagerScopes,
  revokeRole,
} from "@/lib/modules/users/account-admin.service";
import { userFacingError } from "@/lib/errors/domain-error";

const RoleActionSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(Role),
});

export async function grantRoleAction(formData: FormData) {
  const actor = await requireRole(Role.SUPER_USER);
  const parsed = RoleActionSchema.parse(Object.fromEntries(formData));
  await grantRole(parsed.userId, parsed.role, {
    actorUserId: actor.id,
    ctx: await getRequestContext(),
  });
  revalidatePath("/admin/roles");
}

export async function revokeRoleAction(formData: FormData) {
  const actor = await requireRole(Role.SUPER_USER);
  const parsed = RoleActionSchema.parse(Object.fromEntries(formData));
  try {
    await revokeRole(parsed.userId, parsed.role, {
      actorUserId: actor.id,
      ctx: await getRequestContext(),
    });
    revalidatePath("/admin/roles");
  } catch (error) {
    redirect(`/admin/roles?error=${encodeURIComponent(userFacingError(error))}`);
  }
}

export async function replaceManagerScopesAction(formData: FormData) {
  const actor = await requireRole(Role.SUPER_USER);
  const userId = z.string().uuid().parse(formData.get("userId"));
  const storeIds = z.array(z.string().uuid()).parse(formData.getAll("storeIds"));
  await replaceManagerScopes(userId, storeIds, {
    actorUserId: actor.id,
    ctx: await getRequestContext(),
  });
  revalidatePath("/admin/roles");
}
