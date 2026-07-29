import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { UserStatus, TokenPurpose, type Prisma } from "@/app/generated/prisma/client";
import { findUsableToken, markTokenUsed } from "./setup-tokens.service";
import { hashPassword } from "./password";
import { createSession, getRequestContext } from "./session";
import { PasswordSchema } from "./password-policy";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";

export const CompleteInitialSetupSchema = z.object({
  loginName: z.string().min(1, "キャスト名を入力してください"),
  code: z.string().regex(/^\d{4}$/, "初期設定コードは数字4桁で入力してください"),
  newPassword: PasswordSchema,
});

export type CompleteInitialSetupResult = { ok: true } | { ok: false; error: string };

const GENERIC_FAILURE =
  "キャスト名または初期設定コードが正しくないか、有効期限が切れています。";

/**
 * REQ-AUTH-005: 初期設定コード検証→本人がパスワード設定→コード失効→ACTIVE化→ログインセッション開始。
 */
export async function completeInitialSetup(
  loginName: string,
  code: string,
  newPassword: string,
): Promise<CompleteInitialSetupResult> {
  const ctx = await getRequestContext();

  const user = await db.user.findFirst({
    where: { loginName, status: UserStatus.PENDING_SETUP },
  });
  if (!user) {
    return { ok: false, error: GENERIC_FAILURE };
  }

  const tokenCheck = await findUsableToken(user.id, TokenPurpose.INITIAL_SETUP, code);
  if (!tokenCheck.ok || !tokenCheck.tokenId) {
    await recordAuditLog({
      actorUserId: user.id,
      action: AUDIT_ACTIONS.INITIAL_SETUP_TOKEN_REJECTED,
      entityType: "User",
      entityId: user.id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return { ok: false, error: GENERIC_FAILURE };
  }

  const passwordHash = await hashPassword(newPassword);
  const tokenId = tokenCheck.tokenId;

  const completed = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    if (!(await markTokenUsed(tokenId, tx))) return false;
    await tx.user.update({ where: { id: user.id }, data: { status: UserStatus.ACTIVE } });
    await tx.userCredential.update({
      where: { userId: user.id },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
    await recordAuditLog(
      {
        actorUserId: user.id,
        action: AUDIT_ACTIONS.INITIAL_SETUP_COMPLETED,
        entityType: "User",
        entityId: user.id,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      },
      tx,
    );
    return true;
  });

  if (!completed) return { ok: false, error: GENERIC_FAILURE };

  await createSession(user.id);
  return { ok: true };
}
