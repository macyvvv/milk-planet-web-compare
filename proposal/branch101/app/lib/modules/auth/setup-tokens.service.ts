import "server-only";
import { db } from "@/lib/db";
import { TokenPurpose, type Prisma } from "@/app/generated/prisma/client";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import { generateSetupCode, hashToken, tokensMatch } from "./tokens";
import type { RequestContext } from "./session";

const SETUP_TOKEN_TTL_MS = 72 * 60 * 60 * 1000; // 3 days: long enough for an admin to relay the code in person
const MAX_TOKEN_FAILURES = 5;
const TOKEN_LOCK_DURATION_MS = 15 * 60 * 1000;

export interface IssueTokenInput {
  userId: string;
  purpose: TokenPurpose;
  issuedById: string;
  ctx: RequestContext;
}

type TokenClient = Pick<Prisma.TransactionClient, "passwordSetupToken" | "auditLog">;

/**
 * REQ-AUTH-006: 初期設定コードは平文保存しない・有効期限あり・使用後は再利用不可。
 * 発行の都度、同ユーザー・同目的の未使用トークンを即時失効させる(D-006関連: コード発行は
 * 常にAREA_MANAGER以上のみが呼び出す前提。呼び出し側で requireRole 済みであること)。
 * 平文コードは戻り値としてのみ返し、DBにもログにも残さない(呼び出し元が画面へ一度だけ表示する)。
 */
export async function issueSetupToken(
  input: IssueTokenInput,
  client: TokenClient | typeof db = db,
): Promise<string> {
  const code = generateSetupCode();
  const tokenHash = hashToken(code);
  const expiresAt = new Date(Date.now() + SETUP_TOKEN_TTL_MS);

  const issue = async (tx: TokenClient) => {
    // Invalidate any still-usable prior token of the same purpose for this user.
    await tx.passwordSetupToken.updateMany({
      where: { userId: input.userId, purpose: input.purpose, usedAt: null },
      data: { expiresAt: new Date() },
    });

    await tx.passwordSetupToken.create({
      data: {
        userId: input.userId,
        purpose: input.purpose,
        tokenHash,
        expiresAt,
        issuedById: input.issuedById,
      },
    });

    await recordAuditLog(
      {
        actorUserId: input.issuedById,
        action: AUDIT_ACTIONS.INITIAL_SETUP_TOKEN_ISSUED,
        entityType: "User",
        entityId: input.userId,
        reason: input.purpose,
        ipAddress: input.ctx.ipAddress,
        userAgent: input.ctx.userAgent,
      },
      tx,
    );
  };

  if (client === db) {
    await db.$transaction(async (tx: Prisma.TransactionClient) => issue(tx));
  } else {
    await issue(client);
  }

  return code;
}

export interface ConsumeTokenResult {
  ok: boolean;
  tokenId?: string;
}

/**
 * Verifies a one-time code for a user + purpose without consuming it. The caller (a use case
 * that also validates the new password) is responsible for calling markTokenUsed() only after
 * every other step succeeds, so a failed password validation doesn't burn a valid code.
 */
export async function findUsableToken(
  userId: string,
  purpose: TokenPurpose,
  code: string,
): Promise<ConsumeTokenResult> {
  const candidateHash = hashToken(code);
  const token = await db.passwordSetupToken.findFirst({
    where: { userId, purpose, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { issuedAt: "desc" },
  });

  if (!token || (token.lockedUntil && token.lockedUntil > new Date())) {
    return { ok: false };
  }
  if (!tokensMatch(candidateHash, token.tokenHash)) {
    const updated = await db.passwordSetupToken.update({
      where: { id: token.id },
      data: { failedAttempts: { increment: 1 } },
    });
    if (updated.failedAttempts >= MAX_TOKEN_FAILURES) {
      await db.passwordSetupToken.update({
        where: { id: token.id },
        data: {
          failedAttempts: 0,
          lockedUntil: new Date(Date.now() + TOKEN_LOCK_DURATION_MS),
        },
      });
    }
    return { ok: false };
  }

  return { ok: true, tokenId: token.id };
}

export async function markTokenUsed(
  tokenId: string,
  client: Pick<typeof db, "passwordSetupToken"> = db,
) {
  const result = await client.passwordSetupToken.updateMany({
    where: { id: tokenId, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  return result.count === 1;
}
