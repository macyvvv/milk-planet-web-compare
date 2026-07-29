import "server-only";
import { db } from "@/lib/db";
import type { AuditAction } from "./actions";

/** Either the shared db client or a transaction client from db.$transaction(async (tx) => ...). */
type AuditableClient = Pick<typeof db, "auditLog">;

export interface AuditEntryInput {
  actorUserId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  storeId?: string | null;
  periodId?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
  reason?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Appends one audit_logs row. policy.md: 監査ログは追記専用、更新・削除の経路を作らない —
 * accordingly this module exposes no update/delete function, on purpose.
 *
 * Call this inside the same db.$transaction() as the mutation it documents whenever the
 * mutation and its audit record must succeed or fail together (pass `tx` as `client`).
 */
export async function recordAuditLog(
  entry: AuditEntryInput,
  client: AuditableClient = db,
): Promise<void> {
  await client.auditLog.create({
    data: {
      actorUserId: entry.actorUserId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      storeId: entry.storeId ?? null,
      periodId: entry.periodId ?? null,
      beforeData: toJsonInput(entry.beforeData),
      afterData: toJsonInput(entry.afterData),
      reason: entry.reason ?? null,
      requestId: entry.requestId ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    },
  });
}

function toJsonInput(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.stringify(value);
}
