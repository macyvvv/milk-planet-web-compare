"use server";

import { redirect } from "next/navigation";
import {
  completeInitialSetup,
  CompleteInitialSetupSchema,
} from "@/lib/modules/auth/complete-initial-setup";

export interface InitialSetupFormState {
  error?: string;
  fieldErrors?: Partial<Record<"loginName" | "code" | "newPassword", string>>;
}

export async function completeInitialSetupAction(
  _prevState: InitialSetupFormState | undefined,
  formData: FormData,
): Promise<InitialSetupFormState> {
  const parsed = CompleteInitialSetupSchema.safeParse({
    loginName: formData.get("loginName"),
    code: formData.get("code"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: InitialSetupFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<InitialSetupFormState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "入力内容を確認してください。", fieldErrors };
  }

  const result = await completeInitialSetup(
    parsed.data.loginName,
    parsed.data.code,
    parsed.data.newPassword,
  );

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/");
}
