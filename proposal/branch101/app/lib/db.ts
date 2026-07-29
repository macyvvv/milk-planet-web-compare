import "server-only";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const adapter = new PrismaLibSQL(libsql);

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
