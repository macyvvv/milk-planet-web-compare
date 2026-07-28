import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasRole, canAccessStore, resolveStoreScope } from "./permissions.ts";

const AREA_WIDE = ["AREA_MANAGER", "SUPER_USER"] as never[];
const STORE_MANAGER = ["STORE_MANAGER", "STORE_DEPUTY_MANAGER"] as never[];

describe("hasRole", () => {
  it("is true when the user has one of the listed roles", () => {
    assert.equal(hasRole({ roles: ["CAST" as never] }, "CAST" as never, "SUPER_USER" as never), true);
  });
  it("is false otherwise", () => {
    assert.equal(hasRole({ roles: ["CAST" as never] }, "SUPER_USER" as never), false);
  });
});

describe("canAccessStore", () => {
  it("grants area-wide roles access to any store", () => {
    const user = { roles: ["AREA_MANAGER" as never], managerStoreIds: [] };
    assert.equal(canAccessStore(user, "store-1", AREA_WIDE, STORE_MANAGER), true);
  });

  it("grants store managers access only to their scoped stores", () => {
    const user = { roles: ["STORE_MANAGER" as never], managerStoreIds: ["store-1"] };
    assert.equal(canAccessStore(user, "store-1", AREA_WIDE, STORE_MANAGER), true);
    assert.equal(canAccessStore(user, "store-2", AREA_WIDE, STORE_MANAGER), false);
  });

  it("denies casts and other roles entirely", () => {
    const user = { roles: ["CAST" as never], managerStoreIds: [] };
    assert.equal(canAccessStore(user, "store-1", AREA_WIDE, STORE_MANAGER), false);
  });
});

describe("resolveStoreScope", () => {
  it("returns ALL for area-wide roles", () => {
    const user = { roles: ["SUPER_USER" as never], managerStoreIds: [] };
    assert.equal(resolveStoreScope(user, AREA_WIDE), "ALL");
  });

  it("returns the explicit manager scope otherwise", () => {
    const user = { roles: ["STORE_MANAGER" as never], managerStoreIds: ["store-1", "store-2"] };
    assert.deepEqual(resolveStoreScope(user, AREA_WIDE), ["store-1", "store-2"]);
  });
});
