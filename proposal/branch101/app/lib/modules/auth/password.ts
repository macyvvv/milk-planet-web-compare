import "server-only";
import { hash, verify } from "@node-rs/argon2";

// OWASP-recommended minimum parameters for Argon2id (algorithm defaults to Argon2id when
// unspecified). system_spec.md 6章: パスワードはArgon2idでハッシュ化する(平文保存しない)。
const ARGON2_OPTIONS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(
  storedHash: string,
  plainPassword: string,
): Promise<boolean> {
  try {
    return await verify(storedHash, plainPassword, ARGON2_OPTIONS);
  } catch {
    // Malformed/foreign hash string. Treat as a verification failure, never throw to callers.
    return false;
  }
}
