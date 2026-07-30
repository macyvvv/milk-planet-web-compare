import "server-only";
import { z } from "zod";

// DATABASE_URL is intentionally not validated here: this module loads on every request,
// and Phase 1 development can proceed (routing, UI, non-DB logic) before a real database
// is provisioned (basis/decision_log.md D-001). Prisma raises a clear error the moment a
// query actually needs a connection, which is fail-fast enough without blocking `next dev`.
const envSchema = z.object({
  DATABASE_AUTH_TOKEN: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
  SESSION_COOKIE_NAME: z.string().default("mp_session"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  EPHEMERAL_SQLITE_DEMO: z.string().optional(),
  DEMO_SESSION_SECRET: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.EPHEMERAL_SQLITE_DEMO === "1") {
    if (!val.DEMO_SESSION_SECRET || val.DEMO_SESSION_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DEMO_SESSION_SECRET must be at least 32 characters when EPHEMERAL_SQLITE_DEMO=1",
        path: ["DEMO_SESSION_SECRET"],
      });
    }
  }
});

export const env = envSchema.parse({
  DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  NODE_ENV: process.env.NODE_ENV,
  EPHEMERAL_SQLITE_DEMO: process.env.EPHEMERAL_SQLITE_DEMO,
  DEMO_SESSION_SECRET: process.env.DEMO_SESSION_SECRET,
});
