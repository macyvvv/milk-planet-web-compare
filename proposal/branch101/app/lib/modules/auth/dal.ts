import "server-only";
import { cache } from "react";
import { redirect, forbidden } from "next/navigation";
import { db } from "@/lib/db";
import { Role } from "@/app/generated/prisma/client";
import { readSession } from "./session";
import { hasRole as hasRolePure, canAccessStore as canAccessStorePure, resolveStoreScope as resolveStoreScopePure } from "./permissions";

const AREA_WIDE_ROLES = [Role.AREA_MANAGER, Role.SUPER_USER];
const STORE_MANAGER_ROLES = [Role.STORE_MANAGER, Role.STORE_DEPUTY_MANAGER];

export interface CurrentUser {
  id: string;
  loginName: string;
  displayName: string;
  displayNameKana: string;
  roles: Role[];
  /** Effective store scope for STORE_MANAGER/STORE_DEPUTY_MANAGER; empty for other roles. */
  managerStoreIds: string[];
}

/**
 * Data Access Layer entry point (per Next.js auth guidance): the single place that turns a
 * session cookie into a trustworthy user record. Memoized per request with React's cache().
 * Only ACTIVE users resolve to a user (REQ-AUTH-004: ログイン処理は有効ユーザーのみを検索する
 * — the same rule applies to every subsequent authorization check, not just login).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      rolesGranted: { where: { revokedAt: null } },
      managerScopes: { where: { revokedAt: null } },
    },
  });

  if (!user || user.status !== "ACTIVE") return null;

  return {
    id: user.id,
    loginName: user.loginName,
    displayName: user.displayName,
    displayNameKana: user.displayNameKana,
    roles: user.rolesGranted.map((r) => r.role),
    managerStoreIds: user.managerScopes.map((s) => s.storeId),
  };
});

/** For pages/actions that require *some* authenticated user. Redirects to /login otherwise. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function hasRole(user: CurrentUser, ...roles: Role[]): boolean {
  return hasRolePure(user, ...roles);
}

/** For pages/actions restricted to specific roles. Throws a 403 (see app/forbidden.tsx). */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!hasRole(user, ...roles)) forbidden();
  return user;
}

/**
 * Store-scope check used by every store-scoped read/write (authorization_matrix.md 0章,2章).
 * AREA_MANAGER/SUPER_USER: all stores. STORE_MANAGER/STORE_DEPUTY_MANAGER: only stores in their
 * active manager_store_scopes. Everyone else: no store-level access.
 */
export function canAccessStore(user: CurrentUser, storeId: string): boolean {
  return canAccessStorePure(user, storeId, AREA_WIDE_ROLES, STORE_MANAGER_ROLES);
}

/** Throws 403 unless the current user may act on the given store. */
export async function requireStoreAccess(storeId: string): Promise<CurrentUser> {
  const user = await requireUser();
  if (!canAccessStore(user, storeId)) forbidden();
  return user;
}

/**
 * Resolves the store scope to filter list queries by. `"ALL"` for AREA_MANAGER/SUPER_USER
 * (query layer should apply no store filter); an explicit (possibly empty) id list otherwise.
 */
export function resolveStoreScope(user: CurrentUser): "ALL" | string[] {
  return resolveStoreScopePure(user, AREA_WIDE_ROLES);
}
