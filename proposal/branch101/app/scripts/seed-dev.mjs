import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";
import { hash } from "@node-rs/argon2";

const url = process.env.DATABASE_URL || "file:./dev.db";
const db = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const ARGON2_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

try {
  const existing = await db.execute("SELECT COUNT(*) AS count FROM users");
  if (Number(existing.rows[0]?.count ?? 0) !== 0) {
    console.log("Database already seeded (users exist). Exiting.");
    process.exit(0);
  }

  const now = new Date().toISOString();
  
  // Create an admin
  const adminId = randomUUID();
  const adminPasswordHash = await hash("1234", ARGON2_OPTIONS);
  
  // Create stores
  const storeAId = randomUUID();
  const storeBId = randomUUID();

  // Create casts
  const castId1 = randomUUID();
  const castId2 = randomUUID();
  const castPasswordHash = await hash("1234", ARGON2_OPTIONS);

  const tx = await db.transaction("write");
  try {
    // 1. Admin user
    await tx.execute({
      sql: `INSERT INTO users (id, login_name, display_name, display_name_kana, status, version, created_at, updated_at) VALUES (?, 'admin', 'admin', 'あどみん', 'ACTIVE', 1, ?, ?)`,
      args: [adminId, now, now],
    });
    await tx.execute({
      sql: `INSERT INTO user_credentials (user_id, password_hash, password_algo, failed_login_attempts, password_updated_at) VALUES (?, ?, 'argon2id', 0, ?)`,
      args: [adminId, adminPasswordHash, now],
    });
    await tx.execute({
      sql: `INSERT INTO user_roles (id, user_id, role, granted_by, granted_at) VALUES (?, ?, 'SUPER_USER', ?, ?)`,
      args: [randomUUID(), adminId, adminId, now],
    });

    // 2. Stores
    await tx.execute({
      sql: `INSERT INTO stores (id, code, name, status, created_at, updated_at) VALUES (?, '001', '秋葉原店', 'ACTIVE', ?, ?)`,
      args: [storeAId, now, now],
    });
    await tx.execute({
      sql: `INSERT INTO stores (id, code, name, status, created_at, updated_at) VALUES (?, '002', '池袋店', 'ACTIVE', ?, ?)`,
      args: [storeBId, now, now],
    });

    // 3. Casts
    await tx.execute({
      sql: `INSERT INTO users (id, login_name, display_name, display_name_kana, status, version, created_at, updated_at) VALUES (?, 'cast01', 'テスト キャスト1', 'てすと きゃすと1', 'ACTIVE', 1, ?, ?)`,
      args: [castId1, now, now],
    });
    await tx.execute({
      sql: `INSERT INTO users (id, login_name, display_name, display_name_kana, status, version, created_at, updated_at) VALUES (?, 'cast02', 'テスト キャスト2', 'てすと きゃすと2', 'ACTIVE', 1, ?, ?)`,
      args: [castId2, now, now],
    });

    for (const cid of [castId1, castId2]) {
      await tx.execute({
        sql: `INSERT INTO user_credentials (user_id, password_hash, password_algo, failed_login_attempts, password_updated_at) VALUES (?, ?, 'argon2id', 0, ?)`,
        args: [cid, castPasswordHash, now],
      });
      await tx.execute({
        sql: `INSERT INTO user_roles (id, user_id, role, granted_by, granted_at) VALUES (?, ?, 'CAST', ?, ?)`,
        args: [randomUUID(), cid, adminId, now],
      });
    }

    // 4. Memberships
    await tx.execute({
      sql: `INSERT INTO cast_store_memberships (id, user_id, store_id, membership_type, valid_from, granted_by, granted_at) VALUES (?, ?, ?, 'PRIMARY', '2025-01-01', ?, ?)`,
      args: [randomUUID(), castId1, storeAId, adminId, now],
    });
    await tx.execute({
      sql: `INSERT INTO cast_store_memberships (id, user_id, store_id, membership_type, valid_from, granted_by, granted_at) VALUES (?, ?, ?, 'PRIMARY', '2025-01-01', ?, ?)`,
      args: [randomUUID(), castId2, storeBId, adminId, now],
    });

    await tx.commit();
    console.log("Dev seeding completed successfully. Users: admin/1234, cast01/1234, cast02/1234");
  } catch (e) {
    tx.close();
    throw e;
  }

} finally {
  db.close();
}
