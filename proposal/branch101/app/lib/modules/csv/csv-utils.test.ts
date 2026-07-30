import assert from "node:assert/strict";
import test from "node:test";
import { csvRowData, parseCsvText, sanitizeCsvCell } from "./csv-utils.ts";

test("csvRowData accepts canonical and legacy double-encoded rows", () => {
  assert.deepEqual(csvRowData({ login_name: "a" }), { login_name: "a" });
  assert.deepEqual(csvRowData('{"login_name":"a"}'), { login_name: "a" });
});

test("parseCsvText parses UTF-8 BOM headers", () => {
  const result = parseCsvText("\uFEFFoperation,name\r\nUPSERT,本店\r\n");
  assert.equal(result.errors.length, 0);
  assert.equal(result.data[0].operation, "UPSERT");
});

test("sanitizeCsvCell blocks spreadsheet formulas", () => {
  assert.equal(sanitizeCsvCell("=1+1"), "'=1+1");
  assert.equal(sanitizeCsvCell("normal"), "normal");
});
