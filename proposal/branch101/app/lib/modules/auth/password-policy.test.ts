import assert from "node:assert/strict";
import test from "node:test";
import { PinSchema } from "./password-policy.ts";

test("PinSchema accepts exactly four ASCII digits", () => {
  assert.equal(PinSchema.safeParse("0123").success, true);
  assert.equal(PinSchema.safeParse("123").success, false);
  assert.equal(PinSchema.safeParse("12345").success, false);
  assert.equal(PinSchema.safeParse("12a4").success, false);
  assert.equal(PinSchema.safeParse("１２３４").success, false);
});
