ALTER TABLE "password_setup_tokens"
  ADD COLUMN "failed_attempts" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "password_setup_tokens"
  ADD COLUMN "locked_until" DATETIME;
