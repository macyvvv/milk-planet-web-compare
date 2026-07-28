import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

// Prisma 7's "prisma-client" generator requires an explicit driver adapter (no bundled query
// engine binary). DATABASE_URL is read here, not in lib/env.ts, so pages that never touch the
// database can still render before a real database is provisioned (basis/decision_log.md D-001).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Next.js dev server hot-reloads modules, which would otherwise create a new PrismaClient
// (and a new connection pool) on every edit. Cache the instance on globalThis in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
