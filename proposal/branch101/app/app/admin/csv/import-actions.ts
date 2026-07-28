"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { getRequestContext } from "@/lib/modules/auth/session";
import { uploadCastsCsv, applyCastsCsv } from "@/lib/modules/csv/import-casts.service";
import { uploadAvailabilityCsv, applyAvailabilityCsv } from "@/lib/modules/csv/import-availability.service";

export interface CsvActionState {
  error?: string;
}

export interface ApplyCastsState {
  error?: string;
  results?: { displayName: string; loginName: string; setupCode: string }[];
}

export async function uploadCastsCsvAction(
  _prevState: CsvActionState | undefined,
  formData: FormData,
): Promise<CsvActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "CSVファイルを選択してください。" };

  const user = await requireRole(Role.AREA_MANAGER, Role.SUPER_USER);
  const csvText = await file.text();
  const jobId = await uploadCastsCsv({ csvText, uploadedById: user.id });
  redirect(`/admin/csv/preview/${jobId}`);
}

/**
 * 結果(初期設定コードを含む)はこの1回のレスポンスでのみ画面表示し、リダイレクトしない
 * (REQ-AUTH-006: 平文コードはDB・ログに残さない。再表示もできないため、その場で必ず控えてもらう)。
 */
export async function applyCastsCsvAction(
  _prevState: ApplyCastsState | undefined,
  formData: FormData,
): Promise<ApplyCastsState> {
  const jobId = z.string().uuid().parse(formData.get("jobId"));
  const user = await requireRole(Role.AREA_MANAGER, Role.SUPER_USER);
  const ctx = await getRequestContext();

  try {
    const results = await applyCastsCsv({ jobId, actorUserId: user.id, ctx });
    return { results };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "反映に失敗しました。" };
  }
}

const AvailabilityUploadSchema = z.object({
  periodId: z.string().uuid(),
  storeId: z.string().uuid(),
  reason: z.string().min(1, "実行理由を入力してください"),
});

export async function uploadAvailabilityCsvAction(
  _prevState: CsvActionState | undefined,
  formData: FormData,
): Promise<CsvActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "CSVファイルを選択してください。" };

  const parsed = AvailabilityUploadSchema.safeParse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };

  // REQ-CSV-004: SUPER_USER限定の緊急復旧操作。
  const user = await requireRole(Role.SUPER_USER);
  const csvText = await file.text();
  const jobId = await uploadAvailabilityCsv({
    csvText,
    periodId: parsed.data.periodId,
    storeId: parsed.data.storeId,
    reason: parsed.data.reason,
    uploadedById: user.id,
  });
  redirect(`/admin/csv/preview/${jobId}`);
}

export async function applyAvailabilityCsvActionForm(formData: FormData): Promise<void> {
  const jobId = z.string().uuid().parse(formData.get("jobId"));
  const user = await requireRole(Role.SUPER_USER);
  const ctx = await getRequestContext();
  await applyAvailabilityCsv({ jobId, actorUserId: user.id, ctx });
  redirect(`/admin/csv/preview/${jobId}`);
}
