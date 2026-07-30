export type RegistrationRole =
  | "CAST"
  | "STORE_MANAGER"
  | "STORE_DEPUTY_MANAGER"
  | "AREA_MANAGER"
  | "SUPER_USER";

export const REGISTRATION_ROLE_LABELS: Record<RegistrationRole, string> = {
  CAST: "一般ユーザー（キャスト）",
  STORE_MANAGER: "店舗管理者（店長）",
  STORE_DEPUTY_MANAGER: "店舗管理者（副店長）",
  AREA_MANAGER: "エリアマネージャー",
  SUPER_USER: "スーパーユーザー",
};

export function registrationNeedsManagerStores(role: RegistrationRole): boolean {
  return role === "STORE_MANAGER" || role === "STORE_DEPUTY_MANAGER";
}

export function canAssignRegistrationRole(
  isSuperUser: boolean,
  role: RegistrationRole,
): boolean {
  return role === "CAST" || isSuperUser;
}

export function normalizeRegistrationStoreScopes(
  role: RegistrationRole,
  primaryStoreId: string,
  selectedStoreIds: string[],
): string[] {
  if (!registrationNeedsManagerStores(role)) return [];
  return [...new Set([primaryStoreId, ...selectedStoreIds])];
}
