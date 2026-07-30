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
import {
  canAssignRegistrationRole,
  type RegistrationRole,
} from "@/lib/modules/users/registration-policy";
import { userFacingError } from "@/lib/errors/domain-error";

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
  role: z.enum(Role),
  managedStoreIds: z.array(z.string().uuid()).default([]),
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
  const parsed = RegisterSchema.safeParse({
    loginName: formData.get("loginName"),
    displayName: formData.get("displayName"),
    displayNameKana: formData.get("displayNameKana"),
    storeId: formData.get("storeId"),
    role: formData.get("role") || Role.CAST,
    managedStoreIds: formData.getAll("managedStoreIds"),
  });
  if (!parsed.success) return { error: "登録内容を確認してください。" };
  const actor = await requireAccountOperator();
  if (!canAccessStore(actor, parsed.data.storeId)) return { error: "対象店舗を操作できません。" };
  if (!canAssignRegistrationRole(hasRole(actor, Role.SUPER_USER), parsed.data.role as RegistrationRole)) {
    return { error: "一般ユーザー以外の権限はスーパーユーザーだけが割り当てられます。" };
  }
  for (const storeId of parsed.data.managedStoreIds) {
    if (!canAccessStore(actor, storeId)) return { error: "管理対象に指定できない店舗が含まれています。" };
  }
  try {
    const result = await registerCast({
      ...parsed.data,
      role: parsed.data.role as RegistrationRole,
      actorUserId: actor.id,
      ctx: await getRequestContext(),
    });
    revalidatePath("/admin/users");
    return {
      message: `${result.user.displayName}を登録しました。`,
      setupCode: result.setupCode,
    };
  } catch (error) {
    return { error: userFacingError(error, "登録に失敗しました。ログイン名の重複を確認してください。") };
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

export async function updateResignationAction(
  _state: UserActionState | undefined,
  formData: FormData
): Promise<UserActionState> {
  const actor = await requireAccountOperator();
  const userId = z.string().uuid().parse(formData.get("userId"));
  const dateStr = formData.get("resignationDate") as string;
  await requireTargetAccess(actor, userId);

  try {
    const { updateResignationDate } = await import("@/lib/modules/users/users.service");
    const resignationDate = dateStr ? new Date(dateStr) : null;
    await updateResignationDate(userId, resignationDate, {
      actorUserId: actor.id,
      ctx: await getRequestContext(),
    });
    revalidatePath("/admin/users");
    return { message: "退店予定日を更新しました。" };
  } catch {
    return { error: "更新に失敗しました。" };
  }
}

export async function updateMembershipsAction(
  _state: UserActionState | undefined,
  formData: FormData
): Promise<UserActionState> {
  const actor = await requireAccountOperator();
  const userId = z.string().uuid().parse(formData.get("userId"));
  const storeIds = formData.getAll("storeIds") as string[];
  await requireTargetAccess(actor, userId);

  try {
    const { updateMemberships } = await import("@/lib/modules/users/users.service");
    await updateMemberships(userId, storeIds, {
      actorUserId: actor.id,
      ctx: await getRequestContext(),
    });
    revalidatePath("/admin/users");
    return { message: "所属店舗を更新しました。" };
  } catch {
    return { error: "更新に失敗しました。" };
  }
}
