import { z } from "zod";

// No explicit length/complexity rule is specified in requirements.md beyond "secure hashing" —
// this is a reasonable minimum baseline (system_spec.md 6章), not a business requirement, so it
// can be tightened later without touching data or other modules.
export const PasswordSchema = z
  .string()
  .min(10, "パスワードは10文字以上で入力してください")
  .max(200, "パスワードは200文字以内で入力してください")
  .refine((value) => /[a-zA-Z]/.test(value) && /[0-9]/.test(value), {
    message: "パスワードは英字と数字を両方含めてください",
  });
