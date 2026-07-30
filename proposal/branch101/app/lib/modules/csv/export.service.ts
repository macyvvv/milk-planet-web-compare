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
    include: {
      store: true,
      user: {
        include: {
          rolesGranted: { where: { revokedAt: null } },
          managerScopes: { where: { revokedAt: null }, include: { store: true } },
        },
      },
    },
  });

  const columns = [
    "operation", "user_id", "login_name", "display_name", "display_name_kana", "store_code",
    "pin", "permission_level", "job_title", "managed_store_codes", "resignation_scheduled_on",
  ];
  const rows = memberships.map((m) => ({
    operation: "UPSERT",
    user_id: m.user.id,
    login_name: m.user.loginName,
    display_name: m.user.displayName,
    display_name_kana: m.user.displayNameKana,
    store_code: m.store.code,
    pin: "",
    permission_level:
      m.user.rolesGranted.some((role) => role.role === "SUPER_USER") ? "SUPER_USER" :
      m.user.rolesGranted.some((role) => role.role === "AREA_MANAGER") ? "AREA_MANAGER" :
      m.user.rolesGranted.some((role) => ["STORE_MANAGER", "STORE_DEPUTY_MANAGER"].includes(role.role))
        ? "STORE_ADMIN" : "GENERAL_USER",
    job_title: m.user.rolesGranted[0]?.role ?? "CAST",
    managed_store_codes: m.user.managerScopes.map((scope) => scope.store.code).join("|"),
    resignation_scheduled_on: fmtDate(m.user.resignationScheduledOn),
  }));

  await recordExportJob(CsvExportType.CASTS, rows.length, requestedById);
  return toCsvBytes(toCsvText(rows, columns));
}

export async function exportStores(requestedById: string): Promise<Uint8Array> {
  const stores = await db.store.findMany({ orderBy: { code: "asc" } });
  const columns = ["operation", "store_code", "name", "status"];
  const rows = stores.map((store) => ({
    operation: "UPSERT",
    store_code: store.code,
    name: store.name,
    status: store.status,
  }));
  await recordExportJob(CsvExportType.STORES, rows.length, requestedById);
  return toCsvBytes(toCsvText(rows, columns));
}

export async function exportPeriodCastTargets(requestedById: string): Promise<Uint8Array> {
  const targets = await db.periodCastTarget.findMany({
    include: { period: true, store: true, user: true },
    orderBy: [{ period: { startDate: "asc" } }, { store: { code: "asc" } }],
  });
  const columns = [
    "operation", "period_start_date", "store_code", "user_id", "login_name",
    "target_status", "exclusion_reason",
  ];
  const rows = targets.map((target) => ({
    operation: "UPSERT",
    period_start_date: fmtDate(target.period.startDate),
    store_code: target.store.code,
    user_id: target.user.id,
    login_name: target.user.loginName,
    target_status: target.targetStatus,
    exclusion_reason: target.exclusionReason ?? "",
  }));
  await recordExportJob(CsvExportType.PERIOD_CAST_TARGETS, rows.length, requestedById);
  return toCsvBytes(toCsvText(rows, columns));
}

export async function exportNotificationTemplates(requestedById: string): Promise<Uint8Array> {
  const templates = await db.notificationTemplate.findMany({ orderBy: { templateType: "asc" } });
  const stores = await db.store.findMany({ select: { id: true, code: true } });
  const storeCodes = new Map(stores.map((store) => [store.id, store.code]));
  const columns = ["operation", "template_type", "store_code", "body"];
  const rows = templates.map((template) => ({
    operation: "UPSERT",
    template_type: template.templateType,
    store_code: template.storeId ? storeCodes.get(template.storeId) ?? "" : "",
    body: template.body,
  }));
  await recordExportJob(CsvExportType.NOTIFICATION_TEMPLATES, rows.length, requestedById);
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

  const period = await db.period.findUniqueOrThrow({ where: { id: periodId } });
  const store = await db.store.findUniqueOrThrow({ where: { id: storeId } });
  const columns = [
    "operation", "login_name", "store_code", "period_start_date", "work_date",
    "start_time", "end_time", "cast_note", "admin_note", "change_reason",
  ];
  const rows = shifts.map((s) => ({
    operation: "UPSERT",
    login_name: s.user.loginName,
    store_code: store.code,
    period_start_date: fmtDate(period.startDate),
    work_date: fmtDate(s.workDate),
    start_time: s.startAt.toISOString().slice(11, 16),
    end_time: s.endAt.toISOString().slice(11, 16),
    cast_note: s.castNote ?? "",
    admin_note: s.adminNote ?? "",
    change_reason: s.changeReason ?? "",
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

  const columns = ["operation", "event_id", "name", "event_date", "is_all_stores", "store_codes", "cast_note", "admin_note", "change_reason"];
  const rows = events.map((e) => ({
    operation: "UPSERT",
    event_id: e.id,
    name: e.name,
    event_date: fmtDate(e.eventDate),
    is_all_stores: String(e.isAllStores),
    store_codes: e.isAllStores ? "" : e.stores.map((s) => s.store.code).join("|"),
    cast_note: e.castNote ?? "",
    admin_note: e.adminNote ?? "",
    change_reason: "",
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

  const columns = ["operation", "login_name", "store_code", "valid_from", "valid_to", "membership_type"];
  const rows = memberships.map((m) => ({
    operation: "UPSERT",
    login_name: m.user.loginName,
    store_code: m.store.code,
    valid_from: fmtDate(m.validFrom),
    valid_to: fmtDate(m.validTo),
    membership_type: m.membershipType,
  }));

  await recordExportJob(CsvExportType.MEMBERSHIPS, rows.length, requestedById);
  return toCsvBytes(toCsvText(rows, columns));
}
