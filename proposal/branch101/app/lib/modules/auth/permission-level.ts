type RoleValue =
  | "CAST"
  | "STORE_MANAGER"
  | "STORE_DEPUTY_MANAGER"
  | "AREA_MANAGER"
  | "SUPER_USER";

export const PermissionLevel = {
  GENERAL_USER: "GENERAL_USER",
  STORE_ADMIN: "STORE_ADMIN",
  AREA_MANAGER: "AREA_MANAGER",
  SUPER_USER: "SUPER_USER",
} as const;

export type PermissionLevel = (typeof PermissionLevel)[keyof typeof PermissionLevel];

export const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  GENERAL_USER: "一般ユーザー",
  STORE_ADMIN: "店舗管理者",
  AREA_MANAGER: "エリアマネージャー",
  SUPER_USER: "スーパーユーザー",
};

export function permissionLevelForRoles(roles: Iterable<RoleValue>): PermissionLevel {
  const values = new Set(roles);
  if (values.has("SUPER_USER")) return PermissionLevel.SUPER_USER;
  if (values.has("AREA_MANAGER")) return PermissionLevel.AREA_MANAGER;
  if (values.has("STORE_MANAGER") || values.has("STORE_DEPUTY_MANAGER")) {
    return PermissionLevel.STORE_ADMIN;
  }
  return PermissionLevel.GENERAL_USER;
}
