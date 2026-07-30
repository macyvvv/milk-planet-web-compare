"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import { createStore, updateStore } from "@/lib/modules/stores/stores.service";
import { Prisma } from "@/app/generated/prisma/client";

export interface StoreFormState {
  error?: string;
  success?: string;
}

const StoreSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "店舗コードを入力してください"),
  name: z.string().min(1, "店舗名を入力してください"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function saveStoreAction(
  _prevState: StoreFormState | undefined,
  formData: FormData,
): Promise<StoreFormState> {
  const parsed = StoreSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };

  await requireRole(Role.SUPER_USER);

  try {
    if (parsed.data.id) {
      await updateStore({
        storeId: parsed.data.id,
        code: parsed.data.code,
        name: parsed.data.name,
        status: parsed.data.status ?? "ACTIVE",
      });
    } else {
      await createStore({
        code: parsed.data.code,
        name: parsed.data.name,
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "この店舗コードは既に使用されています" };
    }
    return { error: error instanceof Error ? error.message : "保存に失敗しました" };
  }

  revalidatePath("/admin/stores");
  return { success: "保存しました" };
}
