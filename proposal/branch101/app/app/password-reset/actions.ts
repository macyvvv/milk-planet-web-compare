"use server";

import { redirect } from "next/navigation";
import {
  completePasswordReset,
  CompletePasswordResetSchema,
} from "@/lib/modules/auth/complete-password-reset";

export interface PasswordResetFormState {
  error?: string;
  fieldErrors?: Partial<Record<"loginName" | "code" | "newPassword", string>>;
}

export async function completePasswordResetAction(
  _prevState: PasswordResetFormState | undefined,
  formData: FormData,
): Promise<PasswordResetFormState> {
  const parsed = CompletePasswordResetSchema.safeParse({
    loginName: formData.get("loginName"),
    code: formData.get("code"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: PasswordResetFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<PasswordResetFormState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "入力内容を確認してください。", fieldErrors };
  }

  const result = await completePasswordReset(
    parsed.data.loginName,
    parsed.data.code,
    parsed.data.newPassword,
  );

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/");
}
