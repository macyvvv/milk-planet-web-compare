-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "login_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "display_name_kana" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_SETUP',
    "resignation_scheduled_on" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_credentials" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "password_hash" TEXT,
    "password_algo" TEXT NOT NULL DEFAULT 'argon2id',
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" DATETIME,
    "password_updated_at" DATETIME,
    CONSTRAINT "user_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "granted_by" TEXT NOT NULL,
    "granted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_by" TEXT,
    "revoked_at" DATETIME,
    CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_roles_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_roles_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "manager_store_scopes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "granted_by" TEXT NOT NULL,
    "granted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" DATETIME,
    CONSTRAINT "manager_store_scopes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "manager_store_scopes_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "manager_store_scopes_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cast_store_memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "valid_from" DATETIME NOT NULL,
    "valid_to" DATETIME,
    "membership_type" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cast_store_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cast_store_memberships_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cast_store_memberships_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "periods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "period_store_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "submission_open_at" DATETIME,
    "submission_deadline_at" DATETIME,
    "collection_status" TEXT NOT NULL DEFAULT 'PREPARING',
    "scheduling_status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "publication_status" TEXT NOT NULL DEFAULT 'UNPUBLISHED',
    "published_at" DATETIME,
    "events_confirmed_at" DATETIME,
    "events_confirmed_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "period_store_settings_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "period_store_settings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "period_cast_targets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "exclusion_reason" TEXT,
    "generated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "period_cast_targets_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "period_cast_targets_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "period_cast_targets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "event_date" DATETIME NOT NULL,
    "is_all_stores" BOOLEAN NOT NULL DEFAULT false,
    "cast_note" TEXT,
    "admin_note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "current_version_no" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "event_stores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    CONSTRAINT "event_stores_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "event_stores_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "event_date" DATETIME NOT NULL,
    "is_all_stores" BOOLEAN NOT NULL,
    "store_ids_snapshot" TEXT NOT NULL,
    "cast_note" TEXT,
    "admin_note" TEXT,
    "status" TEXT NOT NULL,
    "change_reason" TEXT,
    "changed_by" TEXT NOT NULL,
    "changed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_versions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_acknowledgements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "acknowledged_version_no" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'UP_TO_DATE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "event_acknowledgements_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "event_acknowledgements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "event_acknowledgements_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "event_acknowledgements_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "standard_shift_patterns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "is_working" BOOLEAN NOT NULL,
    "start_minutes" INTEGER,
    "end_minutes" INTEGER,
    "note" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "standard_shift_patterns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "availability_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "header_status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "submitted_at" DATETIME,
    "current_version_no" INTEGER NOT NULL DEFAULT 0,
    "last_reopened_at" DATETIME,
    "last_reopened_by" TEXT,
    "last_reopen_reason" TEXT,
    "last_reopen_deadline_at" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "availability_submissions_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "availability_submissions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "availability_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "availability_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submission_id" TEXT NOT NULL,
    "target_date" DATETIME NOT NULL,
    "availability_status" TEXT NOT NULL,
    "start_at" DATETIME,
    "end_at" DATETIME,
    "note" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "availability_entries_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "availability_submissions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "availability_submission_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submission_id" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "header_status_at_save" TEXT NOT NULL,
    "entries_snapshot" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "availability_submission_versions_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "availability_submissions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "confirmed_shifts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "work_date" DATETIME NOT NULL,
    "start_at" DATETIME NOT NULL,
    "end_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "admin_note" TEXT,
    "cast_note" TEXT,
    "change_reason" TEXT,
    "current_version_no" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "confirmed_shifts_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "confirmed_shifts_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "confirmed_shifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "confirmed_shift_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "confirmed_shift_id" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "store_id" TEXT NOT NULL,
    "work_date" DATETIME NOT NULL,
    "start_at" DATETIME NOT NULL,
    "end_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "admin_note" TEXT,
    "cast_note" TEXT,
    "change_reason" TEXT,
    "is_post_publication_change" BOOLEAN NOT NULL DEFAULT false,
    "cast_notified_status" TEXT,
    "notified_at" DATETIME,
    "notified_by" TEXT,
    "changed_by" TEXT NOT NULL,
    "changed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "confirmed_shift_versions_confirmed_shift_id_fkey" FOREIGN KEY ("confirmed_shift_id") REFERENCES "confirmed_shifts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shift_publications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "publication_no" INTEGER NOT NULL,
    "published_by" TEXT NOT NULL,
    "published_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shift_publications_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shift_publications_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "published_shift_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publication_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "work_date" DATETIME NOT NULL,
    "start_at" DATETIME NOT NULL,
    "end_at" DATETIME NOT NULL,
    "admin_note_snapshot" TEXT,
    "cast_note_snapshot" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "published_shift_entries_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "shift_publications" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template_type" TEXT NOT NULL,
    "store_id" TEXT,
    "body" TEXT NOT NULL,
    "updated_by" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "generated_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template_type" TEXT NOT NULL,
    "store_id" TEXT,
    "period_id" TEXT NOT NULL,
    "content_snapshot" TEXT NOT NULL,
    "generated_by" TEXT NOT NULL,
    "generated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "generated_notifications_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_setup_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "used_at" DATETIME,
    "issued_by" TEXT NOT NULL,
    "issued_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_setup_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_reset_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "requested_note" TEXT,
    "approved_by" TEXT NOT NULL,
    "approved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issued_token_id" TEXT NOT NULL,
    CONSTRAINT "password_reset_requests_issued_token_id_fkey" FOREIGN KEY ("issued_token_id") REFERENCES "password_setup_tokens" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME NOT NULL,
    "revoked_at" DATETIME,
    "ip_address" TEXT,
    "user_agent" TEXT,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "csv_import_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "job_type" TEXT NOT NULL,
    "store_id" TEXT,
    "period_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "reason" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_by" TEXT,
    "applied_at" DATETIME,
    "error_summary" TEXT
);

-- CreateTable
CREATE TABLE "csv_import_rows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "job_id" TEXT NOT NULL,
    "row_no" INTEGER NOT NULL,
    "raw_data" TEXT NOT NULL,
    "validation_errors" TEXT,
    "status" TEXT NOT NULL,
    CONSTRAINT "csv_import_rows_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "csv_import_jobs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "csv_export_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "export_type" TEXT NOT NULL,
    "store_id" TEXT,
    "period_id" TEXT,
    "row_count" INTEGER NOT NULL,
    "requested_by" TEXT NOT NULL,
    "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "store_id" TEXT,
    "period_id" TEXT,
    "before_data" TEXT,
    "after_data" TEXT,
    "reason" TEXT,
    "request_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "manager_store_scopes_user_id_idx" ON "manager_store_scopes"("user_id");

-- CreateIndex
CREATE INDEX "manager_store_scopes_store_id_idx" ON "manager_store_scopes"("store_id");

-- CreateIndex
CREATE INDEX "cast_store_memberships_user_id_idx" ON "cast_store_memberships"("user_id");

-- CreateIndex
CREATE INDEX "cast_store_memberships_store_id_idx" ON "cast_store_memberships"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "periods_start_date_end_date_key" ON "periods"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "period_store_settings_period_id_store_id_key" ON "period_store_settings"("period_id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "period_cast_targets_period_id_store_id_user_id_key" ON "period_cast_targets"("period_id", "store_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_stores_event_id_store_id_key" ON "event_stores"("event_id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_versions_event_id_version_no_key" ON "event_versions"("event_id", "version_no");

-- CreateIndex
CREATE UNIQUE INDEX "event_acknowledgements_event_id_user_id_period_id_key" ON "event_acknowledgements"("event_id", "user_id", "period_id");

-- CreateIndex
CREATE UNIQUE INDEX "standard_shift_patterns_user_id_day_of_week_key" ON "standard_shift_patterns"("user_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "availability_submissions_period_id_store_id_user_id_key" ON "availability_submissions"("period_id", "store_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "availability_entries_submission_id_target_date_key" ON "availability_entries"("submission_id", "target_date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_submission_versions_submission_id_version_no_key" ON "availability_submission_versions"("submission_id", "version_no");

-- CreateIndex
CREATE INDEX "confirmed_shifts_user_id_work_date_idx" ON "confirmed_shifts"("user_id", "work_date");

-- CreateIndex
CREATE INDEX "confirmed_shifts_period_id_store_id_idx" ON "confirmed_shifts"("period_id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "confirmed_shift_versions_confirmed_shift_id_version_no_key" ON "confirmed_shift_versions"("confirmed_shift_id", "version_no");

-- CreateIndex
CREATE UNIQUE INDEX "shift_publications_period_id_store_id_publication_no_key" ON "shift_publications"("period_id", "store_id", "publication_no");

-- CreateIndex
CREATE UNIQUE INDEX "published_shift_entries_publication_id_user_id_work_date_key" ON "published_shift_entries"("publication_id", "user_id", "work_date");

-- CreateIndex
CREATE INDEX "password_setup_tokens_user_id_purpose_idx" ON "password_setup_tokens"("user_id", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_requests_issued_token_id_key" ON "password_reset_requests"("issued_token_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "csv_import_rows_job_id_row_no_key" ON "csv_import_rows"("job_id", "row_no");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_store_id_period_id_idx" ON "audit_logs"("store_id", "period_id");
