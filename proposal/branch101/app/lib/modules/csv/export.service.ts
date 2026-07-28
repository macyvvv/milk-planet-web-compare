import "server-only";
import { db } from "@/lib/db";
import { CsvExportType } from "@/app/generated/prisma/client";
import { toCsvText, toCsvBytes } from "./csv-utils";
import { listShiftDifferences } from "@/lib/modules/scheduling/scheduling.service";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";

function fmtDate(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}
function fmtDateTime(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 16).replace("T", " ") : "";
}

async function recordExportJob(
  exportType: CsvExportType,
  rowCount: number,
  requestedById: string,
  storeId?: string,
  periodId?: string,
): Promise<void> {
  await db.csvExportJob.create({
    data: { exportType, rowCount, requestedById, storeId, periodId },
  });
  await recordAuditLog({
    actorUserId: requestedById,
    action: AUDIT_ACTIONS.CSV_EXPORTED,
    entityType: "CsvExportJob",
    storeId,
    periodId,
    afterData: { exportType, rowCount },
  });
}

/** REQ-CSV-001: キャスト一覧。 */
export async function exportCasts(storeIds: "ALL" | string[], requestedById: string): Promise<Uint8Array> {
  const memberships = await db.castStoreMembership.findMany({
    where: {
      membershipType: "PRIMARY",
      validTo: null,
      ...(storeIds === "ALL" ? {} : { storeId: { in: storeIds } }),
    },
    include: { user: true, store: true },
  });

  const columns = ["login_name", "display_name", "display_name_kana", "store_name", "status", "resignation_scheduled_on"];
  const rows = memberships.map((m) => ({
    login_name: m.user.loginName,
    display_name: m.user.displayName,
    display_name_kana: m.user.displayNameKana,
    store_name: m.store.name,
    status: m.user.status,
    resignation_scheduled_on: fmtDate(m.user.resignationScheduledOn),
  }));

  await recordExportJob(CsvExportType.CASTS, rows.length, requestedById);
  return toCsvBytes(toCsvText(rows, columns));
}

export async function exportAvailability(periodId: string, storeId: string, requestedById: string): Promise<Uint8Array> {
  const submissions = await db.availabilitySubmission.findMany({
    where: { periodId, storeId },
    include: { user: true, entries: true },
  });

  const columns = ["display_name", "target_date", "availability_status", "start_at", "end_at", "note"];
  const rows = submissions.flatMap((s) =>
    s.entries.map((e) => ({
      display_name: s.user.displayName,
      target_date: fmtDate(e.targetDate),
      availability_status: e.availabilityStatus,
      start_at: fmtDateTime(e.startAt),
      end_at: fmtDateTime(e.endAt),
      note: e.note ?? "",
    })),
  );

  await recordExportJob(CsvExportType.AVAILABILITY, rows.length, requestedById, storeId, periodId);
  return toCsvBytes(toCsvText(rows, columns));
}

export async function exportSubmissions(periodId: string, storeId: string, requestedById: string): Promise<Uint8Array> {
  const submissions = await db.availabilitySubmission.findMany({
    where: { periodId, storeId },
    include: { user: true, entries: true },
  });

  const columns = [
    "display_name",
    "display_name_kana",
    "header_status",
    "submitted_at",
    "updated_at",
    "day_count",
    "total_minutes",
  ];
  const rows = submissions.map((s) => {
    const workingEntries = s.entries.filter((e) => e.availabilityStatus !== "OFF" && e.startAt && e.endAt);
    const totalMinutes = workingEntries.reduce(
      (sum, e) => sum + (e.endAt!.getTime() - e.startAt!.getTime()) / 60000,
      0,
    );
    return {
      display_name: s.user.displayName,
      display_name_kana: s.user.displayNameKana,
      header_status: s.headerStatus,
      submitted_at: fmtDateTime(s.submittedAt),
      updated_at: fmtDateTime(s.updatedAt),
      day_count: String(workingEntries.length),
      total_minutes: String(totalMinutes),
    };
  });

  await recordExportJob(CsvExportType.SUBMISSIONS, rows.length, requestedById, storeId, periodId);
  return toCsvBytes(toCsvText(rows, columns));
}

export async function exportConfirmedShifts(periodId: string, storeId: string, requestedById: string): Promise<Uint8Array> {
  const shifts = await db.confirmedShift.findMany({
    where: { periodId, storeId, status: { not: "CANCELLED" } },
    include: { user: true },
    orderBy: { workDate: "asc" },
  });

  const columns = ["display_name", "work_date", "start_at", "end_at", "status", "admin_note", "cast_note"];
  const rows = shifts.map((s) => ({
    display_name: s.user.displayName,
    work_date: fmtDate(s.workDate),
    start_at: fmtDateTime(s.startAt),
    end_at: fmtDateTime(s.endAt),
    status: s.status,
    admin_note: s.adminNote ?? "",
    cast_note: s.castNote ?? "",
  }));

  await recordExportJob(CsvExportType.CONFIRMED_SHIFTS, rows.length, requestedById, storeId, periodId);
  return toCsvBytes(toCsvText(rows, columns));
}

export async function exportDifferences(periodId: string, storeId: string, requestedById: string): Promise<Uint8Array> {
  const diffs = await listShiftDifferences(periodId, storeId);
  const columns = ["display_name", "work_date", "diff_types", "change_reason", "updated_at"];
  const rows = diffs.map((d) => ({
    display_name: d.displayName,
    work_date: fmtDate(d.workDate),
    diff_types: d.diffs.join("|"),
    change_reason: d.changeReason ?? "",
    updated_at: fmtDateTime(d.updatedAt),
  }));

  await recordExportJob(CsvExportType.DIFFERENCES, rows.length, requestedById, storeId, periodId);
  return toCsvBytes(toCsvText(rows, columns));
}

export async function exportEvents(storeIds: "ALL" | string[], requestedById: string): Promise<Uint8Array> {
  const events = await db.event.findMany({
    where:
      storeIds === "ALL" ? {} : { OR: [{ isAllStores: true }, { stores: { some: { storeId: { in: storeIds } } } }] },
    include: { stores: { include: { store: true } } },
  });

  const columns = ["name", "event_date", "scope", "status", "cast_note", "admin_note"];
  const rows = events.map((e) => ({
    name: e.name,
    event_date: fmtDate(e.eventDate),
    scope: e.isAllStores ? "全店舗" : e.stores.map((s) => s.store.name).join("|"),
    status: e.status,
    cast_note: e.castNote ?? "",
    admin_note: e.adminNote ?? "",
  }));

  await recordExportJob(CsvExportType.EVENTS, rows.length, requestedById);
  return toCsvBytes(toCsvText(rows, columns));
}

export async function exportMemberships(storeIds: "ALL" | string[], requestedById: string): Promise<Uint8Array> {
  const memberships = await db.castStoreMembership.findMany({
    where: storeIds === "ALL" ? {} : { storeId: { in: storeIds } },
    include: { user: true, store: true },
    orderBy: { validFrom: "asc" },
  });

  const columns = ["display_name", "store_name", "membership_type", "valid_from", "valid_to"];
  const rows = memberships.map((m) => ({
    display_name: m.user.displayName,
    store_name: m.store.name,
    membership_type: m.membershipType,
    valid_from: fmtDate(m.validFrom),
    valid_to: fmtDate(m.validTo),
  }));

  await recordExportJob(CsvExportType.MEMBERSHIPS, rows.length, requestedById);
  return toCsvBytes(toCsvText(rows, columns));
}
