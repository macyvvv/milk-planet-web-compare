import assert from "node:assert/strict";
import test from "node:test";
import {
  canAssignRegistrationRole,
  normalizeRegistrationStoreScopes,
  registrationNeedsManagerStores,
} from "./registration-policy.ts";

test("only a super user can assign elevated roles", () => {
  assert.equal(canAssignRegistrationRole(false, "CAST"), true);
  assert.equal(canAssignRegistrationRole(false, "STORE_MANAGER"), false);
  assert.equal(canAssignRegistrationRole(false, "AREA_MANAGER"), false);
  assert.equal(canAssignRegistrationRole(true, "SUPER_USER"), true);
});

test("store manager roles require manager stores", () => {
  assert.equal(registrationNeedsManagerStores("STORE_MANAGER"), true);
  assert.equal(registrationNeedsManagerStores("STORE_DEPUTY_MANAGER"), true);
  assert.equal(registrationNeedsManagerStores("CAST"), false);
  assert.equal(registrationNeedsManagerStores("AREA_MANAGER"), false);
});

test("manager scopes always contain the primary store and are unique", () => {
  assert.deepEqual(
    normalizeRegistrationStoreScopes("STORE_MANAGER", "store-a", ["store-b", "store-a"]),
    ["store-a", "store-b"],
  );
});

test("non-store roles do not retain manager scopes", () => {
  assert.deepEqual(
    normalizeRegistrationStoreScopes("SUPER_USER", "store-a", ["store-b"]),
    [],
  );
});
