import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");

const db = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const migrationsRoot = new URL("../prisma/migrations/", import.meta.url);

try {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      name TEXT NOT NULL PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const appliedResult = await db.execute("SELECT name FROM app_migrations");
  const applied = new Set(appliedResult.rows.map((row) => String(row.name)));
  const entries = (await readdir(migrationsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const name of entries) {
    if (applied.has(name)) continue;
    const sql = await readFile(join(migrationsRoot.pathname, name, "migration.sql"), "utf8");
    const transaction = await db.transaction("write");
    try {
      await transaction.executeMultiple(sql);
      await transaction.execute({
        sql: "INSERT INTO app_migrations (name) VALUES (?)",
        args: [name],
      });
      await transaction.commit();
      console.log(`Applied ${name}`);
    } catch (error) {
      transaction.close();
      throw error;
    }
  }
  console.log("libSQL migrations are up to date.");
} finally {
  db.close();
}
