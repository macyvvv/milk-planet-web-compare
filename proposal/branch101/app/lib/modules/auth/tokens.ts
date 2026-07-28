import "server-only";
import { randomBytes, randomInt, createHash, timingSafeEqual } from "node:crypto";

/** High-entropy opaque token for session cookies. Never stored in plaintext (see hashToken). */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

// Excludes visually ambiguous characters (0/O, 1/I/L) since a human relays this code verbally
// or via chat (REQ-AUTH-005). 10 chars from a 31-symbol alphabet is ~49 bits of entropy, well
// beyond what a rate-limited, one-time, expiring code needs.
const SETUP_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateSetupCode(length = 10): string {
  let code = "";
  for (let i = 0; i < length; i++) {
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
