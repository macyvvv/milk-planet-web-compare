import "server-only";
import { db } from "@/lib/db";
import { TokenPurpose } from "@/app/generated/prisma/client";
import { issueSetupToken } from "./setup-tokens.service";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "./session";

export interface ApprovePasswordResetInput {
  userId: string;
  approvedById: string;
  requestedNote?: string;
  ctx: RequestContext;
}

/**
 * REQ-AUTH-007 手順1-3: 本人からの連絡を受けた管理者が許可し、一回限りの再設定コードを発行する。
 * 呼び出し側で requireRole(...) 済みであること(D-006: 暫定でAREA_MANAGER以上に限定)。
 * 返り値の平文コードはここでのみ生成され、DB/監査ログには残らない(呼び出し元画面で一度だけ表示)。
 */
export async function approvePasswordReset(input: ApprovePasswordResetInput): Promise<string> {
  const code = await issueSetupToken({
    userId: input.userId,
    purpose: TokenPurpose.PASSWORD_RESET,
    issuedById: input.approvedById,
    ctx: input.ctx,
  });

  const token = await db.passwordSetupToken.findFirst({
    where: { userId: input.userId, purpose: TokenPurpose.PASSWORD_RESET, usedAt: null },
    orderBy: { issuedAt: "desc" },
  });
  if (!token) {
    throw new Error("Failed to issue password reset token");
  }

  await db.passwordResetRequest.create({
    data: {
      userId: input.userId,
      requestedNote: input.requestedNote,
      approvedById: input.approvedById,
      issuedTokenId: token.id,
    },
  });

  await recordAuditLog({
    actorUserId: input.approvedById,
    action: AUDIT_ACTIONS.PASSWORD_RESET_APPROVED,
    entityType: "User",
    entityId: input.userId,
    reason: input.requestedNote,
    ipAddress: input.ctx.ipAddress,
    userAgent: input.ctx.userAgent,
  });

  return code;
}
