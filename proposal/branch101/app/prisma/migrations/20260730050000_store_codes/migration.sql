ALTER TABLE "stores" ADD COLUMN "code" TEXT;

UPDATE "stores"
SET "code" = printf('STORE_%08d', rowid)
WHERE "code" IS NULL;

CREATE UNIQUE INDEX "stores_code_key" ON "stores"("code");
