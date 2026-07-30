import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { UserStatus } from "@/app/generated/prisma/client";
import { verifyPassword } from "./password";
import { createSession, getRequestContext } from "./session";
import { findUserByLoginName } from "@/lib/modules/users/users.service";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const LoginSchema = z.object({
  loginName: z.string().min(1, "キャスト名を入力してください"),
  password: z.string().regex(/^\d{4}$/, "PINは数字4桁で入力してください"),
});

export type LoginResult = { ok: true } | { ok: false; error: string };

const INVALID_CREDENTIALS = "キャスト名またはPINが正しくありません。";
const LOCKED_MESSAGE =
  "ログイン試行回数が上限に達しました。しばらくしてから再度お試しください。";

/**
 * REQ-AUTH-004,009: 有効ユーザーのみ検索、失敗回数によるレート制限と一時ロック、
 * 成功/失敗を監査ログへ記録。パスワード未設定(初期設定未完了)のユーザーはログイン不可。
 */
export async function login(loginName: string, password: string): Promise<LoginResult> {
  const ctx = await getRequestContext();
  const user = await findUserByLoginName(loginName);

  if (!user || user.status !== UserStatus.ACTIVE || !user.credential?.passwordHash) {
    await recordAuditLog({
      actorUserId: user?.id ?? null,
      action: AUDIT_ACTIONS.LOGIN_FAILURE,
      entityType: "User",
      entityId: user?.id ?? null,
      reason: "user_not_found_or_not_active",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return { ok: false, error: INVALID_CREDENTIALS };
  }

  if (user.credential.lockedUntil && user.credential.lockedUntil > new Date()) {
    await recordAuditLog({
      actorUserId: user.id,
      action: AUDIT_ACTIONS.LOGIN_FAILURE,
      entityType: "User",
      entityId: user.id,
      reason: "locked",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return { ok: false, error: LOCKED_MESSAGE };
  }

  const passwordOk = await verifyPassword(user.credential.passwordHash, password);

  if (!passwordOk) {
    const updatedCredential = await db.userCredential.update({
      where: { userId: user.id },
      data: {
        failedLoginAttempts: { increment: 1 },
      },
    });
    const shouldLock = updatedCredential.failedLoginAttempts >= MAX_FAILED_ATTEMPTS;
    if (shouldLock) {
      await db.userCredential.update({
        where: { userId: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
        },
      });
    }

    await recordAuditLog({
      actorUserId: user.id,
      action: shouldLock ? AUDIT_ACTIONS.ACCOUNT_LOCKED : AUDIT_ACTIONS.LOGIN_FAILURE,
      entityType: "User",
      entityId: user.id,
      reason: "bad_password",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return { ok: false, error: shouldLock ? LOCKED_MESSAGE : INVALID_CREDENTIALS };
  }

  await db.userCredential.update({
    where: { userId: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  await createSession(user.id);

  await recordAuditLog({
    actorUserId: user.id,
    action: AUDIT_ACTIONS.LOGIN_SUCCESS,
    entityType: "User",
    entityId: user.id,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  return { ok: true };
}
