import "server-only";
import { db } from "@/lib/db";
import {
  CsvJobType,
  CsvImportStatus,
  CsvRowStatus,
} from "@/app/generated/prisma/client";
import { csvRowData, parseCsvText } from "./csv-utils";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import type { RequestContext } from "@/lib/modules/auth/session";

export const EVENT_IMPORT_COLUMNS = ["name", "event_date", "is_all_stores", "store_names", "cast_note", "admin_note"] as const;

interface EventImportRowData {
  name: string;
  event_date: string; // YYYY-MM-DD
  is_all_stores: string; // true or false
  store_names: string; // comma separated if not all stores
  cast_note: string;
  admin_note: string;
}

export interface UploadEventsCsvInput {
  csvText: string;
  uploadedById: string;
}

export async function uploadEventsCsv(input: UploadEventsCsvInput) {
  const job = await db.csvImportJob.create({
    data: { jobType: CsvJobType.EVENTS, status: CsvImportStatus.VALIDATING, uploadedById: input.uploadedById },
  });

  const { data, errors: parseErrors } = parseCsvText(input.csvText);

  if (parseErrors.length > 0 || data.length === 0) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: { status: CsvImportStatus.VALIDATION_FAILED, errorSummary: parseErrors.join(" / ") || "データ行がありません。" },
    });
    return job.id;
  }

  const headerOk = EVENT_IMPORT_COLUMNS.every((col) => Object.keys(data[0]).includes(col));
  if (!headerOk) {
    await db.csvImportJob.update({
      where: { id: job.id },
      data: { status: CsvImportStatus.VALIDATION_FAILED, errorSummary: `ヘッダーが不正です。必要な列: ${EVENT_IMPORT_COLUMNS.join(", ")}` },
    });
    return job.id;
  }

  const stores = await db.store.findMany();
  const storeByName = new Map(stores.map((s) => [s.name, s]));
  let anyInvalid = false;

  for (let i = 0; i < data.length; i++) {
    const raw = data[i] as unknown as EventImportRowData;
    const rowErrors: string[] = [];

    if (!raw.name?.trim()) rowErrors.push("nameが空です。");
    if (!raw.event_date?.trim() || isNaN(Date.parse(raw.event_date.trim()))) {
      rowErrors.push("event_dateが不正です（YYYY-MM-DD形式）。");
    }

    const isAllStoresStr = raw.is_all_stores?.trim().toLowerCase();
    if (!["true", "false"].includes(isAllStoresStr)) {
      rowErrors.push("is_all_storesは true または false を指定してください。");
    }

    if (isAllStoresStr === "false") {
      if (!raw.store_names?.trim()) {
        rowErrors.push("is_all_storesがfalseの場合、store_namesを指定してください。");
      } else {
        const names = raw.store_names.split(",").map(n => n.trim()).filter(Boolean);
        for (const n of names) {
          if (!storeByName.has(n)) rowErrors.push(`店舗「${n}」が存在しません。`);
        }
      }
    }

    const status = rowErrors.length > 0 ? CsvRowStatus.INVALID : CsvRowStatus.VALID;
    if (status === CsvRowStatus.INVALID) anyInvalid = true;

    await db.csvImportRow.create({
      data: {
        jobId: job.id,
        rowNo: i + 1,
        rawData: JSON.stringify(raw),
        validationErrors: rowErrors.length > 0 ? JSON.stringify(rowErrors) : undefined,
        status,
      },
    });
  }

  await db.csvImportJob.update({
    where: { id: job.id },
    data: { status: anyInvalid ? CsvImportStatus.VALIDATION_FAILED : CsvImportStatus.PREVIEW_READY },
  });

  return job.id;
}

export interface ApplyEventsCsvInput {
  jobId: string;
  actorUserId: string;
  ctx: RequestContext;
}

export async function applyEventsCsv(input: ApplyEventsCsvInput): Promise<number> {
  const job = await db.csvImportJob.findUniqueOrThrow({ where: { id: input.jobId }, include: { rows: true } });

  if (job.status !== CsvImportStatus.PREVIEW_READY) throw new Error("このジョブは確定可能な状態ではありません。");
  if (job.rows.some((r) => r.status === CsvRowStatus.INVALID)) throw new Error("無効な行が含まれています。");

  const stores = await db.store.findMany();
  const storeByName = new Map(stores.map((s) => [s.name, s]));
  let count = 0;

  await db.$transaction(async (tx) => {
    for (const row of job.rows) {
      const raw = csvRowData<EventImportRowData>(row.rawData);
      const isAllStores = raw.is_all_stores.trim().toLowerCase() === "true";

      const eventDate = new Date(raw.event_date.trim());
      const existing = await tx.event.findFirst({ where: { name: raw.name.trim(), eventDate } });
      const eventData = {
          name: raw.name.trim(),
          eventDate,
          isAllStores,
          castNote: raw.cast_note?.trim() || null,
          adminNote: raw.admin_note?.trim() || null,
          createdById: input.actorUserId,
      };
      const event = existing
        ? await tx.event.update({
            where: { id: existing.id },
            data: {
              isAllStores,
              castNote: eventData.castNote,
              adminNote: eventData.adminNote,
              currentVersionNo: { increment: 1 },
            },
          })
        : await tx.event.create({ data: eventData });
      await tx.eventStore.deleteMany({ where: { eventId: event.id } });

      if (!isAllStores && raw.store_names?.trim()) {
        const names = raw.store_names.split(",").map(n => n.trim()).filter(Boolean);
        const storeIds = names.map(n => storeByName.get(n)!.id);

        await tx.eventStore.createMany({
          data: storeIds.map(storeId => ({ eventId: event.id, storeId }))
        });
      }

      count++;
    }

    await tx.csvImportJob.update({
      where: { id: job.id },
      data: { status: CsvImportStatus.APPLIED, appliedById: input.actorUserId, appliedAt: new Date() },
    });

    await recordAuditLog({
      actorUserId: input.actorUserId,
      action: AUDIT_ACTIONS.CSV_IMPORT_APPLIED,
      entityType: "CsvImportJob",
      entityId: job.id,
      afterData: { rowCount: job.rows.length },
      ipAddress: input.ctx.ipAddress,
      userAgent: input.ctx.userAgent,
    }, tx);
  });

  return count;
}
