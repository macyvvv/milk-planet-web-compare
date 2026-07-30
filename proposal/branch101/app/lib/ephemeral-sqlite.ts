import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { hash } from "@node-rs/argon2";
import { createClient } from "@libsql/client";

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};
export const DEMO_SUPER_USER_ID = "00000000-0000-4000-8000-000000000101";
const DEMO_SUPER_USER_ROLE_ID = "00000000-0000-4000-8000-000000000102";
const DEMO_STORE_ID = "00000000-0000-4000-8000-000000000201";
const DEMO_AUDIT_ID = "00000000-0000-4000-8000-000000000301";

let initialization: Promise<void> | undefined;

function requireDemoPin(): string {
  const pin = process.env.DEMO_ADMIN_PIN;
  if (!pin || !/^\d{4}$/.test(pin)) {
    throw new Error("EPHEMERAL_SQLITE_DEMO requires DEMO_ADMIN_PIN to be exactly four digits.");
  }
  return pin;
}

async function migrateAndSeed(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:/tmp/")) {
    throw new Error("EPHEMERAL_SQLITE_DEMO requires DATABASE_URL under file:/tmp/.");
  }

  const db = createClient({ url });
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS app_migrations (
        name TEXT NOT NULL PRIMARY KEY,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const appliedResult = await db.execute("SELECT name FROM app_migrations");
    const applied = new Set(appliedResult.rows.map((row) => String(row.name)));
    const migrationsRoot = path.join(process.cwd(), "prisma", "migrations");
    const migrations = (await readdir(migrationsRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const name of migrations) {
      if (applied.has(name)) continue;
      const sql = await readFile(path.join(migrationsRoot, name, "migration.sql"), "utf8");
      const transaction = await db.transaction("write");
      try {
        await transaction.executeMultiple(sql);
        await transaction.execute({
          sql: "INSERT OR IGNORE INTO app_migrations (name) VALUES (?)",
          args: [name],
        });
        await transaction.commit();
      } catch (error) {
        transaction.close();
        throw error;
      }
    }

    const now = new Date().toISOString();
    const passwordHash = await hash(requireDemoPin(), ARGON2_OPTIONS);
    await db.batch(
      [
        {
          sql: `INSERT OR IGNORE INTO users
            (id, login_name, display_name, display_name_kana, status, version, created_at, updated_at)
            VALUES (?, 'admin', 'admin', 'あどみん', 'ACTIVE', 1, ?, ?)`,
          args: [DEMO_SUPER_USER_ID, now, now],
        },
        {
          sql: `INSERT OR IGNORE INTO user_credentials
            (user_id, password_hash, password_algo, failed_login_attempts, password_updated_at)
            VALUES (?, ?, 'argon2id', 0, ?)`,
          args: [DEMO_SUPER_USER_ID, passwordHash, now],
        },
        {
          sql: `INSERT OR IGNORE INTO user_roles
            (id, user_id, role, granted_by, granted_at)
            VALUES (?, ?, 'SUPER_USER', ?, ?)`,
          args: [DEMO_SUPER_USER_ROLE_ID, DEMO_SUPER_USER_ID, DEMO_SUPER_USER_ID, now],
        },
        {
          sql: `INSERT OR IGNORE INTO stores
            (id, code, name, status, created_at, updated_at)
            VALUES (?, 'DEMO', 'デモ店舗', 'ACTIVE', ?, ?)`,
          args: [DEMO_STORE_ID, now, now],
        },
        {
          sql: `INSERT OR IGNORE INTO audit_logs
            (id, actor_user_id, action, entity_type, entity_id, after_data, created_at)
            VALUES (?, ?, 'DEMO_SUPER_USER_INITIALIZED', 'User', ?, ?, ?)`,
          args: [
            DEMO_AUDIT_ID,
            DEMO_SUPER_USER_ID,
            DEMO_SUPER_USER_ID,
            JSON.stringify({ loginName: "admin", role: "SUPER_USER", ephemeral: true }),
            now,
          ],
        },
      ],
      "write",
    );
  } finally {
    db.close();
  }
}

/** Proposal-only Vercel mode: every server instance owns a disposable SQLite database. */
export function ensureEphemeralSqlite(): Promise<void> {
  if (process.env.EPHEMERAL_SQLITE_DEMO !== "1") return Promise.resolve();
  initialization ??= migrateAndSeed();
  return initialization;
}
