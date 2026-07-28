import "server-only";
import { db } from "@/lib/db";

/** REQ-MEMBER-001: キャストの通常所属店舗は同時点で1店舗。現在有効なPRIMARY所属を返す。 */
export async function getCurrentPrimaryStore(userId: string, on: Date = new Date()) {
  return db.castStoreMembership.findFirst({
    where: {
      userId,
      membershipType: "PRIMARY",
      validFrom: { lte: on },
      OR: [{ validTo: null }, { validTo: { gte: on } }],
    },
    include: { store: true },
  });
}
