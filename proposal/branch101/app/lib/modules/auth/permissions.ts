// authorization_matrix.md の判定ロジック。DB/Next.js APIに触れない純粋関数として dal.ts から
// 分離し、単体テスト対象にする(dal.ts は "server-only" を宣言しており、プレーンなNode実行では
// 読み込めないため)。

import type { Role } from "@/app/generated/prisma/client";

export interface RoleBearer {
  roles: Role[];
}

export function hasRole(user: RoleBearer, ...roles: Role[]): boolean {
  return roles.some((r) => user.roles.includes(r));
}

export interface StoreScopedUser extends RoleBearer {
  managerStoreIds: string[];
}

/**
 * authorization_matrix.md 0章: AREA_MANAGER/SUPER_USERは全店舗、STORE_MANAGER/DEPUTYは
 * 自身のmanager_store_scopesのみ、それ以外は不可。
 */
export function canAccessStore(
  user: StoreScopedUser,
  storeId: string,
  areaWideRoles: Role[],
  storeManagerRoles: Role[],
): boolean {
  if (hasRole(user, ...areaWideRoles)) return true;
  if (hasRole(user, ...storeManagerRoles)) return user.managerStoreIds.includes(storeId);
  return false;
}

export function resolveStoreScope(
  user: StoreScopedUser,
  areaWideRoles: Role[],
): "ALL" | string[] {
  if (hasRole(user, ...areaWideRoles)) return "ALL";
  return user.managerStoreIds;
}
