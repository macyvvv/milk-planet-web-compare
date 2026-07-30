import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

interface DemoSessionPayload {
  version: 1;
  userId: string;
  expiresAt: number;
  nonce: string;
}

function signature(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

export function createDemoSessionToken(
  userId: string,
  expiresAt: Date,
  secret: string,
): string {
  const payload = Buffer.from(
    JSON.stringify({
      version: 1,
      userId,
      expiresAt: expiresAt.getTime(),
      nonce: randomBytes(16).toString("base64url"),
    } satisfies DemoSessionPayload),
  ).toString("base64url");
  return `${payload}.${signature(payload, secret).toString("base64url")}`;
}

export function verifyDemoSessionToken(
  token: string,
  secret: string,
  now = new Date(),
): { userId: string } | null {
  const [payload, encodedSignature, ...extra] = token.split(".");
  if (!payload || !encodedSignature || extra.length) return null;

  try {
    const actual = Buffer.from(encodedSignature, "base64url");
    const expected = signature(payload, secret);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<DemoSessionPayload>;
    if (
      parsed.version !== 1 ||
      typeof parsed.userId !== "string" ||
      !parsed.userId ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= now.getTime()
    ) {
      return null;
    }
    return { userId: parsed.userId };
  } catch {
    return null;
  }
}
