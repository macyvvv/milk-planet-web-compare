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

  const sqliteConstraints = `
-- Partial Unique Indexes
CREATE UNIQUE INDEX IF NOT EXISTS users_login_name_active_unique ON users (login_name) WHERE status IN ('PENDING_SETUP', 'ACTIVE');
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_active_unique ON user_roles (user_id, role) WHERE revoked_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS manager_store_scopes_active_unique ON manager_store_scopes (user_id, store_id) WHERE revoked_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS confirmed_shifts_one_per_cast_per_day ON confirmed_shifts (user_id, work_date) WHERE status <> 'CANCELLED';

-- Immutability Triggers
CREATE TRIGGER IF NOT EXISTS audit_logs_prevent_update BEFORE UPDATE ON audit_logs BEGIN SELECT RAISE(ABORT, 'audit_logs cannot be updated'); END;
CREATE TRIGGER IF NOT EXISTS audit_logs_prevent_delete BEFORE DELETE ON audit_logs BEGIN SELECT RAISE(ABORT, 'audit_logs cannot be deleted'); END;
CREATE TRIGGER IF NOT EXISTS published_shift_entries_prevent_update BEFORE UPDATE ON published_shift_entries BEGIN SELECT RAISE(ABORT, 'published_shift_entries cannot be updated'); END;
CREATE TRIGGER IF NOT EXISTS published_shift_entries_prevent_delete BEFORE DELETE ON published_shift_entries BEGIN SELECT RAISE(ABORT, 'published_shift_entries cannot be deleted'); END;

-- CHECK Constraints via Triggers
CREATE TRIGGER IF NOT EXISTS check_periods_end_after_start_insert BEFORE INSERT ON periods WHEN NEW.end_date <= NEW.start_date BEGIN SELECT RAISE(ABORT, 'periods_end_after_start'); END;
CREATE TRIGGER IF NOT EXISTS check_periods_end_after_start_update BEFORE UPDATE ON periods WHEN NEW.end_date <= NEW.start_date BEGIN SELECT RAISE(ABORT, 'periods_end_after_start'); END;

CREATE TRIGGER IF NOT EXISTS check_period_cast_targets_reason_insert BEFORE INSERT ON period_cast_targets WHEN NEW.target_status <> 'ACTIVE' AND NEW.exclusion_reason IS NULL BEGIN SELECT RAISE(ABORT, 'period_cast_targets_reason_required'); END;
CREATE TRIGGER IF NOT EXISTS check_period_cast_targets_reason_update BEFORE UPDATE ON period_cast_targets WHEN NEW.target_status <> 'ACTIVE' AND NEW.exclusion_reason IS NULL BEGIN SELECT RAISE(ABORT, 'period_cast_targets_reason_required'); END;

CREATE TRIGGER IF NOT EXISTS check_availability_entries_off_insert BEFORE INSERT ON availability_entries WHEN (NEW.availability_status = 'OFF' AND (NEW.start_at IS NOT NULL OR NEW.end_at IS NOT NULL)) OR (NEW.availability_status <> 'OFF' AND (NEW.start_at IS NULL OR NEW.end_at IS NULL OR NEW.end_at <= NEW.start_at)) BEGIN SELECT RAISE(ABORT, 'availability_entries_off_has_no_times'); END;
CREATE TRIGGER IF NOT EXISTS check_availability_entries_off_update BEFORE UPDATE ON availability_entries WHEN (NEW.availability_status = 'OFF' AND (NEW.start_at IS NOT NULL OR NEW.end_at IS NOT NULL)) OR (NEW.availability_status <> 'OFF' AND (NEW.start_at IS NULL OR NEW.end_at IS NULL OR NEW.end_at <= NEW.start_at)) BEGIN SELECT RAISE(ABORT, 'availability_entries_off_has_no_times'); END;

CREATE TRIGGER IF NOT EXISTS check_confirmed_shifts_end_insert BEFORE INSERT ON confirmed_shifts WHEN NEW.end_at <= NEW.start_at BEGIN SELECT RAISE(ABORT, 'confirmed_shifts_end_after_start'); END;
CREATE TRIGGER IF NOT EXISTS check_confirmed_shifts_end_update BEFORE UPDATE ON confirmed_shifts WHEN NEW.end_at <= NEW.start_at BEGIN SELECT RAISE(ABORT, 'confirmed_shifts_end_after_start'); END;

CREATE TRIGGER IF NOT EXISTS check_csv_import_jobs_reason_insert BEFORE INSERT ON csv_import_jobs WHEN NEW.job_type = 'AVAILABILITY' AND NEW.reason IS NULL BEGIN SELECT RAISE(ABORT, 'csv_import_jobs_availability_reason_required'); END;
CREATE TRIGGER IF NOT EXISTS check_csv_import_jobs_reason_update BEFORE UPDATE ON csv_import_jobs WHEN NEW.job_type = 'AVAILABILITY' AND NEW.reason IS NULL BEGIN SELECT RAISE(ABORT, 'csv_import_jobs_availability_reason_required'); END;
  `;
  await db.executeMultiple(sqliteConstraints);
  console.log("Applied SQLite manual constraints and triggers.");
} finally {
  db.close();
}
