-- Manual DB constraints that Prisma's schema DSL cannot express (partial unique indexes,
-- GiST exclusion constraints, CHECK constraints). See basis/decision_log.md D-002, D-004
-- and basis/data_model.md section 8 for the rationale behind each constraint.
--
-- This file is NOT applied automatically. Once a real database is provisioned (see basis/
-- decision_log.md D-001), run:
--   npx prisma migrate dev --name init            -- generates the baseline migration from schema.prisma
--   npx prisma migrate dev --name manual_constraints --create-only
--   -- then paste this file's contents into the generated empty migration.sql before applying it
-- so the constraints below are tracked in Prisma's migration history alongside the schema.

-- Required extension for exclusion constraints on user_id + time/date range overlap.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------------------------------------------------------------------------
-- users: login_name unique only among currently "claimable" statuses (D-004)
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX users_login_name_active_unique
  ON users (login_name)
  WHERE status IN ('PENDING_SETUP', 'ACTIVE');

-- ---------------------------------------------------------------------------
-- user_roles: at most one active (non-revoked) grant of a given role per user
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX user_roles_active_unique
  ON user_roles (user_id, role)
  WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------------
-- manager_store_scopes: at most one active scope per (user, store)
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX manager_store_scopes_active_unique
  ON manager_store_scopes (user_id, store_id)
  WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------------
-- cast_store_memberships: PRIMARY memberships for the same user must not overlap in time
-- ---------------------------------------------------------------------------
ALTER TABLE cast_store_memberships
  ADD CONSTRAINT cast_store_memberships_primary_no_overlap
  EXCLUDE USING gist (
    user_id WITH =,
    daterange(valid_from, COALESCE(valid_to, 'infinity'::date), '[]') WITH &&
  )
  WHERE (membership_type = 'PRIMARY');

-- ---------------------------------------------------------------------------
-- periods: end_date must be after start_date
-- ---------------------------------------------------------------------------
ALTER TABLE periods
  ADD CONSTRAINT periods_end_after_start CHECK (end_date > start_date);

-- ---------------------------------------------------------------------------
-- period_cast_targets: exclusion_reason required when target_status is not ACTIVE
-- ---------------------------------------------------------------------------
ALTER TABLE period_cast_targets
  ADD CONSTRAINT period_cast_targets_reason_required
  CHECK (target_status = 'ACTIVE' OR exclusion_reason IS NOT NULL);

-- ---------------------------------------------------------------------------
-- availability_entries: OFF must not carry times; non-OFF must have start < end
-- ---------------------------------------------------------------------------
ALTER TABLE availability_entries
  ADD CONSTRAINT availability_entries_off_has_no_times
  CHECK (
    (availability_status = 'OFF' AND start_at IS NULL AND end_at IS NULL)
    OR (availability_status <> 'OFF' AND start_at IS NOT NULL AND end_at IS NOT NULL AND end_at > start_at)
  );

-- ---------------------------------------------------------------------------
-- confirmed_shifts: end_at after start_at
-- ---------------------------------------------------------------------------
ALTER TABLE confirmed_shifts
  ADD CONSTRAINT confirmed_shifts_end_after_start CHECK (end_at > start_at);

-- confirmed_shifts: one non-cancelled shift per cast per work_date (no same-day multi-store)
CREATE UNIQUE INDEX confirmed_shifts_one_per_cast_per_day
  ON confirmed_shifts (user_id, work_date)
  WHERE status <> 'CANCELLED';

-- confirmed_shifts: no overlapping actual time ranges for the same cast (covers cross-midnight
-- shifts that period_cast_targets's per-day uniqueness above cannot catch)
ALTER TABLE confirmed_shifts
  ADD CONSTRAINT confirmed_shifts_no_time_overlap
  EXCLUDE USING gist (
    user_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
  )
  WHERE (status <> 'CANCELLED');

-- ---------------------------------------------------------------------------
-- confirmed_shift_versions: cast_notified_status required for post-publication changes
-- ---------------------------------------------------------------------------
ALTER TABLE confirmed_shift_versions
  ADD CONSTRAINT confirmed_shift_versions_notified_required
  CHECK (NOT is_post_publication_change OR cast_notified_status IS NOT NULL);

-- ---------------------------------------------------------------------------
-- csv_import_jobs: reason required for AVAILABILITY imports (emergency-recovery only, REQ-CSV-004)
-- ---------------------------------------------------------------------------
ALTER TABLE csv_import_jobs
  ADD CONSTRAINT csv_import_jobs_availability_reason_required
  CHECK (job_type <> 'AVAILABILITY' OR reason IS NOT NULL);

-- ---------------------------------------------------------------------------
-- audit_logs: revoke UPDATE/DELETE from the application role once the role name is known.
-- Replace `app_runtime` with the actual role used by the application's DATABASE_URL.
-- Run this manually as a privileged user after the application role is created; Prisma
-- migrations run as a privileged role and would otherwise be blocked by this grant.
-- ---------------------------------------------------------------------------
-- REVOKE UPDATE, DELETE ON audit_logs FROM app_runtime;
-- REVOKE UPDATE, DELETE ON published_shift_entries FROM app_runtime;
