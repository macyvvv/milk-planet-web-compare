"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role, TokenPurpose } from "@/app/generated/prisma/client";
import { canAccessStore, hasRole, requireRole, type CurrentUser } from "@/lib/modules/auth/dal";
import { db } from "@/lib/db";
import { getRequestContext } from "@/lib/modules/auth/session";
import { approvePasswordReset } from "@/lib/modules/auth/password-reset-requests.service";
import { issueSetupToken } from "@/lib/modules/auth/setup-tokens.service";
import { registerCast } from "@/lib/modules/users/users.service";
import { deactivateAccount, unlockAccount } from "@/lib/modules/users/account-admin.service";

export interface UserActionState {
  error?: string;
  message?: string;
  setupCode?: string;
}

const RegisterSchema = z.object({
  loginName: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  displayNameKana: z.string().trim().min(1),
  storeId: z.string().uuid(),
});

async function requireAccountOperator() {
  return requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );
}

async function requireTargetAccess(actor: CurrentUser, userId: string) {
  if (hasRole(actor, Role.AREA_MANAGER, Role.SUPER_USER)) return;
  const target = await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: { memberships: { where: { validTo: null } } },
  });
  if (!target.memberships.some((membership) => canAccessStore(actor, membership.storeId))) {
    throw new Error("対象アカウントを操作できません。");
  }
}

export async function registerCastAction(
  _state: UserActionState | undefined,
  formData: FormData,
): Promise<UserActionState> {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "登録内容を確認してください。" };
  const actor = await requireAccountOperator();
  if (!canAccessStore(actor, parsed.data.storeId)) return { error: "対象店舗を操作できません。" };
  try {
    const result = await registerCast({
      ...parsed.data,
      actorUserId: actor.id,
      ctx: await getRequestContext(),
    });
    revalidatePath("/admin/users");
    return {
      message: `${result.user.displayName}を登録しました。`,
      setupCode: result.setupCode,
    };
  } catch {
    return { error: "登録に失敗しました。ログイン名の重複を確認してください。" };
  }
}

export async function reissueInitialSetupAction(
  _state: UserActionState | undefined,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await requireRole(Role.SUPER_USER);
  const userId = z.string().uuid().parse(formData.get("userId"));
  const setupCode = await issueSetupToken({
    userId,
    purpose: TokenPurpose.INITIAL_SETUP,
    issuedById: actor.id,
    ctx: await getRequestContext(),
  });
  return { message: "初期設定コードを再発行しました。", setupCode };
}

export async function approvePasswordResetAction(
  _state: UserActionState | undefined,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await requireAccountOperator();
  const userId = z.string().uuid().parse(formData.get("userId"));
  await requireTargetAccess(actor, userId);
  const code = await approvePasswordReset({
    userId,
    approvedById: actor.id,
    requestedNote: String(formData.get("reason") ?? "").trim() || undefined,
    ctx: await getRequestContext(),
  });
  return { message: "PIN再設定を許可しました。", setupCode: code };
}

export async function unlockAccountAction(formData: FormData) {
  const actor = await requireAccountOperator();
  const userId = z.string().uuid().parse(formData.get("userId"));
  await requireTargetAccess(actor, userId);
  await unlockAccount(userId, { actorUserId: actor.id, ctx: await getRequestContext() });
  revalidatePath("/admin/users");
}

export async function deactivateAccountAction(formData: FormData) {
  const actor = await requireRole(Role.SUPER_USER);
  const userId = z.string().uuid().parse(formData.get("userId"));
  const reason = z.string().trim().min(1).parse(formData.get("reason"));
  if (userId === actor.id) throw new Error("自分自身は無効化できません。");
  await deactivateAccount(userId, reason, {
    actorUserId: actor.id,
    ctx: await getRequestContext(),
  });
  revalidatePath("/admin/users");
}
