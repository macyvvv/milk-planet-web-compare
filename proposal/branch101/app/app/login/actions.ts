"use server";

import { redirect } from "next/navigation";
import { login, LoginSchema } from "@/lib/modules/auth/login";

export interface LoginFormState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginFormState | undefined,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = LoginSchema.safeParse({
    loginName: formData.get("loginName"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const result = await login(parsed.data.loginName, parsed.data.password);

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/");
}
