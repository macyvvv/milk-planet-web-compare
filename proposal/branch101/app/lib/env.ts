import "server-only";
import { z } from "zod";

// DATABASE_URL is intentionally not validated here: this module loads on every request,
// and Phase 1 development can proceed (routing, UI, non-DB logic) before a real database
// is provisioned (basis/decision_log.md D-001). Prisma raises a clear error the moment a
// query actually needs a connection, which is fail-fast enough without blocking `next dev`.
const envSchema = z.object({
  SESSION_COOKIE_NAME: z.string().default("mp_session"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export const env = envSchema.parse({
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  NODE_ENV: process.env.NODE_ENV,
});
