import "server-only";
import { randomBytes, randomInt, createHash, timingSafeEqual } from "node:crypto";

/** High-entropy opaque token for session cookies. Never stored in plaintext (see hashToken). */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Four digits are a business requirement; token-level lockout limits online guessing. */
const SETUP_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateSetupCode(length = 10): string {
  let code = "";
  for (let index = 0; index < length; index += 1) {
    code += SETUP_CODE_ALPHABET[randomInt(SETUP_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * One-way digest for storing high-entropy random tokens (session tokens, setup codes) at rest.
 * Argon2id is deliberately NOT used here: it is for slow-hashing low-entropy human-chosen
 * passwords. These tokens are already unguessable, so a fast, deterministic digest is correct
 * (and necessary — session lookup by hash must be fast on every request).
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
