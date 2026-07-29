import "server-only";
import { PrismaClient } from "@/app/generated/prisma/client";

// Next.js dev server hot-reloads modules, which would otherwise create a new PrismaClient
// (and a new connection pool) on every edit. Cache the instance on globalThis in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
