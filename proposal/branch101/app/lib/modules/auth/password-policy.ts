import { z } from "zod";

export const PinSchema = z.string().regex(/^\d{4}$/, "PINは数字4桁で入力してください");
