import "server-only";
import { destroyCurrentSession, getRequestContext } from "./session";
import { getCurrentUser } from "./dal";
import { recordAuditLog } from "@/lib/modules/audit/audit.service";
import { AUDIT_ACTIONS } from "@/lib/modules/audit/actions";

export async function logout(): Promise<void> {
  const user = await getCurrentUser();
  const ctx = await getRequestContext();

  await destroyCurrentSession();

  if (user) {
    await recordAuditLog({
      actorUserId: user.id,
      action: AUDIT_ACTIONS.LOGOUT,
      entityType: "User",
      entityId: user.id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  }
}
