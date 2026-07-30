import assert from "node:assert/strict";
import test from "node:test";
import { PermissionLevel, permissionLevelForRoles } from "./permission-level.ts";

test("store manager and deputy share the STORE_ADMIN permission level", () => {
  assert.equal(permissionLevelForRoles(["STORE_MANAGER"]), PermissionLevel.STORE_ADMIN);
  assert.equal(permissionLevelForRoles(["STORE_DEPUTY_MANAGER"]), PermissionLevel.STORE_ADMIN);
});

test("the highest permission wins", () => {
  assert.equal(
    permissionLevelForRoles(["CAST", "STORE_MANAGER", "SUPER_USER"]),
    PermissionLevel.SUPER_USER,
  );
});
