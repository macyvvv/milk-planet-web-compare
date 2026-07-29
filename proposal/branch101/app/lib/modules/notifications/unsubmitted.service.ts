import "server-only";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";
import {
  formatPeriodLabel,
  buildStoreUnsubmittedText,
  buildAllStoresUnsubmittedText,
  type StoreUnsubmittedGroup,
} from "./notification-text";
import { getTemplate } from "./templates.service";

export interface UnsubmittedCast {
  userId: string;
  displayName: string;
  displayNameKana: string;
}

const DONE_STATUSES = ["SUBMITTED", "LATE_SUBMITTED", "LOCKED"];

/** REQ-UNSUB-001,002: NOT_STARTED/DRAFT(または未着手=提出レコード無し)を未提出とする。五十音順。 */
export async function listUnsubmittedForStore(periodId: string, storeId: string): Promise<UnsubmittedCast[]> {
  const [targets, submissions] = await Promise.all([
    db.periodCastTarget.findMany({
      where: { periodId, storeId, targetStatus: "ACTIVE" },
      include: { user: true },
    }),
    db.availabilitySubmission.findMany({ where: { periodId, storeId } }),
  ]);

  const doneUserIds = new Set(
    submissions.filter((s) => DONE_STATUSES.includes(s.headerStatus)).map((s) => s.userId),
  );

  return targets
    .filter((t) => !doneUserIds.has(t.userId))
    .map((t) => ({
      userId: t.userId,
      displayName: t.user.displayName,
      displayNameKana: t.user.displayNameKana,
    }))
    .sort(
      (a, b) =>
        a.displayNameKana.localeCompare(b.displayNameKana, "ja") ||
        a.displayName.localeCompare(b.displayName, "ja") ||
        a.userId.localeCompare(b.userId),
    );
}

function formatDeadline(d: Date | null): string | undefined {
  if (!d) return undefined;
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${month}月${day}日 ${hh}:${mm}`;
}

export interface GenerateStoreTextInput {
  periodId: string;
  storeId: string;
  generatedById: string;
}

export async function generateStoreUnsubmittedText(input: GenerateStoreTextInput): Promise<string> {
  const [period, setting, unsubmitted, store] = await Promise.all([
    db.period.findUniqueOrThrow({ where: { id: input.periodId } }),
    db.periodStoreSetting.findUnique({
      where: { periodId_storeId: { periodId: input.periodId, storeId: input.storeId } },
    }),
    listUnsubmittedForStore(input.periodId, input.storeId),
    db.store.findUniqueOrThrow({ where: { id: input.storeId } }),
  ]);

  const dbTemplate = await getTemplate("STORE_UNSUBMITTED", input.storeId) ?? await getTemplate("STORE_UNSUBMITTED", null);

  let text = "";
  if (dbTemplate && dbTemplate.body.trim()) {
    text = dbTemplate.body
      .replace(/{{PERIOD_LABEL}}/g, formatPeriodLabel(period.startDate))
      .replace(/{{STORE_NAME}}/g, store.name)
      .replace(/{{CAST_NAMES}}/g, unsubmitted.map((u) => u.displayName).join("、"))
      .replace(/{{DEADLINE_LABEL}}/g, formatDeadline(setting?.submissionDeadlineAt ?? null) ?? "案内を確認してください");
  } else {
    text = buildStoreUnsubmittedText(formatPeriodLabel(period.startDate), {
      storeName: store.name,
      names: unsubmitted.map((u) => u.displayName),
      deadlineLabel: formatDeadline(setting?.submissionDeadlineAt ?? null),
    });
  }

  await db.generatedNotification.create({
    data: {
      templateType: "STORE_UNSUBMITTED",
      storeId: input.storeId,
      periodId: input.periodId,
      contentSnapshot: text,
      generatedById: input.generatedById,
    },
  });
  await recordAuditLog({
    actorUserId: input.generatedById,
    action: AUDIT_ACTIONS.UNSUBMITTED_NOTIFICATION_GENERATED,
    entityType: "GeneratedNotification",
    storeId: input.storeId,
    periodId: input.periodId,
  });

  return text;
}

export interface GenerateAllStoresTextInput {
  periodId: string;
  storeIds: string[];
  generatedById: string;
}

export async function generateAllStoresUnsubmittedText(input: GenerateAllStoresTextInput): Promise<string> {
  const period = await db.period.findUniqueOrThrow({ where: { id: input.periodId } });

  const groups: StoreUnsubmittedGroup[] = await Promise.all(
    input.storeIds.map(async (storeId) => {
      const [store, setting, unsubmitted] = await Promise.all([
        db.store.findUniqueOrThrow({ where: { id: storeId } }),
        db.periodStoreSetting.findUnique({
          where: { periodId_storeId: { periodId: input.periodId, storeId } },
        }),
        listUnsubmittedForStore(input.periodId, storeId),
      ]);
      return {
        storeName: store.name,
        names: unsubmitted.map((u) => u.displayName),
        deadlineLabel: formatDeadline(setting?.submissionDeadlineAt ?? null),
      };
    }),
  );

  const dbTemplate = await getTemplate("ALL_STORES_UNSUBMITTED", null);
  let text = "";
  if (dbTemplate && dbTemplate.body.trim()) {
    const nonEmpty = groups.filter((g) => g.names.length > 0);
    const sameDeadline = nonEmpty.length > 0 && nonEmpty.every((g) => g.deadlineLabel === nonEmpty[0].deadlineLabel);

    const sections = nonEmpty.map((g) => {
      const lines = [`■ ${g.storeName}`, g.names.join("、")];
      if (!sameDeadline && g.deadlineLabel) lines.push(`(締切: ${g.deadlineLabel})`);
      return lines.join("\n");
    });
    const bodyContent = sections.join("\n\n");

    text = dbTemplate.body
      .replace(/{{PERIOD_LABEL}}/g, formatPeriodLabel(period.startDate))
      .replace(/{{BODY}}/g, bodyContent);
  } else {
    text = buildAllStoresUnsubmittedText(formatPeriodLabel(period.startDate), groups);
  }

  await db.generatedNotification.create({
    data: {
      templateType: "ALL_STORES_UNSUBMITTED",
      periodId: input.periodId,
      contentSnapshot: text,
      generatedById: input.generatedById,
    },
  });
  await recordAuditLog({
    actorUserId: input.generatedById,
    action: AUDIT_ACTIONS.UNSUBMITTED_NOTIFICATION_GENERATED,
    entityType: "GeneratedNotification",
    periodId: input.periodId,
  });

  return text;
}
