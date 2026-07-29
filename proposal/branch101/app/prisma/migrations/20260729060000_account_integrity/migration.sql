-- Account invariants that Prisma's SQLite schema cannot express.
CREATE UNIQUE INDEX "users_login_name_claimable_unique"
  ON "users" ("login_name")
  WHERE "status" IN ('PENDING_SETUP', 'ACTIVE');

CREATE UNIQUE INDEX "user_roles_active_unique"
  ON "user_roles" ("user_id", "role")
  WHERE "revoked_at" IS NULL;

CREATE UNIQUE INDEX "manager_store_scopes_active_unique"
  ON "manager_store_scopes" ("user_id", "store_id")
  WHERE "revoked_at" IS NULL;

CREATE TRIGGER "audit_logs_prevent_update"
BEFORE UPDATE ON "audit_logs"
BEGIN
  SELECT RAISE(ABORT, 'audit_logs are append-only');
END;

CREATE TRIGGER "audit_logs_prevent_delete"
BEFORE DELETE ON "audit_logs"
BEGIN
  SELECT RAISE(ABORT, 'audit_logs are append-only');
END;
