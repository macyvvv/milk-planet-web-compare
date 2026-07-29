import { createHash, randomInt, randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";

const LOGIN_NAME = "admin";
const DISPLAY_NAME = "admin";
const DISPLAY_NAME_KANA = "あどみん";
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const TOKEN_TTL_MS = 72 * 60 * 60 * 1000;

function generateSetupCode(length = 10) {
  let code = "";
  for (let index = 0; index < length; index += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required. Run migrations before bootstrap.");
}

const db = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

try {
  const existing = await db.execute("SELECT COUNT(*) AS count FROM users");
  if (Number(existing.rows[0]?.count ?? 0) !== 0) {
    throw new Error("Bootstrap refused: users already exist.");
  }

  const nowDate = new Date();
  const now = nowDate.toISOString();
  const userId = randomUUID();
  const roleId = randomUUID();
  const tokenId = randomUUID();
  const auditId = randomUUID();
  const setupCode = generateSetupCode();

  await db.batch(
    [
      {
        sql: `INSERT INTO users
          (id, login_name, display_name, display_name_kana, status, version, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'PENDING_SETUP', 1, ?, ?)`,
        args: [userId, LOGIN_NAME, DISPLAY_NAME, DISPLAY_NAME_KANA, now, now],
      },
      {
        sql: `INSERT INTO user_credentials
          (user_id, password_algo, failed_login_attempts)
          VALUES (?, 'argon2id', 0)`,
        args: [userId],
      },
      {
        sql: `INSERT INTO user_roles
          (id, user_id, role, granted_by, granted_at)
          VALUES (?, ?, 'SUPER_USER', ?, ?)`,
        args: [roleId, userId, userId, now],
      },
      {
        sql: `INSERT INTO password_setup_tokens
          (id, user_id, purpose, token_hash, expires_at, issued_by, issued_at)
          VALUES (?, ?, 'INITIAL_SETUP', ?, ?, ?, ?)`,
        args: [
          tokenId,
          userId,
          hashToken(setupCode),
          new Date(nowDate.getTime() + TOKEN_TTL_MS).toISOString(),
          userId,
          now,
        ],
      },
      {
        sql: `INSERT INTO audit_logs
          (id, actor_user_id, action, entity_type, entity_id, after_data, created_at)
          VALUES (?, ?, 'SUPER_USER_BOOTSTRAPPED', 'User', ?, ?, ?)`,
        args: [
          auditId,
          userId,
          userId,
          JSON.stringify({ loginName: LOGIN_NAME, role: "SUPER_USER" }),
          now,
        ],
      },
    ],
    "write",
  );

  console.log("SUPER_USER bootstrap completed.");
  console.log(`Login name: ${LOGIN_NAME}`);
  console.log(`Initial setup code (shown once, expires in 72 hours): ${setupCode}`);
  console.log("Open /initial-setup and set the permanent password.");
} finally {
  db.close();
}
