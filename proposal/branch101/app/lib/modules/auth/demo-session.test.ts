import assert from "node:assert/strict";
import test from "node:test";
import { createDemoSessionToken, verifyDemoSessionToken } from "./demo-session.ts";

const secret = "a".repeat(32);
const userId = "00000000-0000-4000-8000-000000000101";

test("demo session verifies an untampered unexpired token", () => {
  const token = createDemoSessionToken(userId, new Date("2030-01-02T00:00:00Z"), secret);
  assert.deepEqual(
    verifyDemoSessionToken(token, secret, new Date("2030-01-01T00:00:00Z")),
    { userId },
  );
});

test("demo session rejects tampering", () => {
  const token = createDemoSessionToken(userId, new Date("2030-01-02T00:00:00Z"), secret);
  assert.equal(
    verifyDemoSessionToken(`${token.slice(0, -1)}x`, secret, new Date("2030-01-01T00:00:00Z")),
    null,
  );
});

test("demo session rejects an expired token", () => {
  const token = createDemoSessionToken(userId, new Date("2030-01-01T00:00:00Z"), secret);
  assert.equal(
    verifyDemoSessionToken(token, secret, new Date("2030-01-01T00:00:01Z")),
    null,
  );
});
