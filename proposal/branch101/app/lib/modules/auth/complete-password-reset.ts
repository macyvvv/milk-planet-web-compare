import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { UserStatus, TokenPurpose, type Prisma } from "@/app/generated/prisma/client";
import { findUsableToken, markTokenUsed } from "./setup-tokens.service";
import { hashPassword } from "./password";
import { createSession, getRequestContext, revokeAllSessionsForUser } from "./session";
import { PasswordSchema } from "./password-policy";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";

export const CompletePasswordResetSchema = z.object({
  loginName: z.string().min(1, "キャスト名を入力してください"),
  code: z.string().min(1, "再設定コードを入力してください"),
  newPassword: PasswordSchema,
});

export type CompletePasswordResetResult = { ok: true } | { ok: false; error: string };

const GENERIC_FAILURE = "キャスト名または再設定コードが正しくないか、有効期限が切れています。";

/**
 * REQ-AUTH-007: 発行済み一回限りコードで新パスワードを登録し、既存セッションを全失効する。
 * 管理者は本人の恒久パスワードを閲覧・指定しない(コード発行のみ。see password-reset-requests.service.ts)。
 */
export async function completePasswordReset(
  loginName: string,
  code: string,
  newPassword: string,
): Promise<CompletePasswordResetResult> {
  const ctx = await getRequestContext();

  const user = await db.user.findFirst({ where: { loginName, status: UserStatus.ACTIVE } });
  if (!user) {
    return { ok: false, error: GENERIC_FAILURE };
  }

  const tokenCheck = await findUsableToken(user.id, TokenPurpose.PASSWORD_RESET, code);
  if (!tokenCheck.ok || !tokenCheck.tokenId) {
    await recordAuditLog({
      actorUserId: user.id,
      action: AUDIT_ACTIONS.PASSWORD_RESET_TOKEN_REJECTED,
      entityType: "User",
      entityId: user.id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return { ok: false, error: GENERIC_FAILURE };
  }

  const passwordHash = await hashPassword(newPassword);
  const tokenId = tokenCheck.tokenId;

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.userCredential.update({
      where: { userId: user.id },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
    await markTokenUsed(tokenId, tx);
    await revokeAllSessionsForUser(user.id, tx);
    await recordAuditLog(
      {
        actorUserId: user.id,
        action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED,
        entityType: "User",
        entityId: user.id,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      },
      tx,
    );
  });

  // Old sessions were just revoked; issue a brand new one for the freshly authenticated user.
  await createSession(user.id);
  return { ok: true };
}
