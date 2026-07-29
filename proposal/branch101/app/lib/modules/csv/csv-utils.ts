import Papa from "papaparse";

// CSVインジェクション対策(system_spec.md 6章、REQ-VALID-001「不正な数式…の無害化」)。
// Excel/Numbers等が数式として解釈しうる先頭文字を含むセルは、シングルクォートを前置して無害化する。
const CSV_FORMULA_PREFIX = /^[=+\-@]/;

export function sanitizeCsvCell(value: string): string {
  return CSV_FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

export function toCsvText(rows: Record<string, string>[], columns: string[]): string {
  const sanitizedRows = rows.map((row) => {
    const out: Record<string, string> = {};
    for (const col of columns) out[col] = sanitizeCsvCell(row[col] ?? "");
    return out;
  });
  return Papa.unparse({ fields: columns, data: sanitizedRows });
}

/** REQ-CSV-001: UTF-8 BOM付き(Excelでの文字化け防止)。 */
export function toCsvBytes(csv: string): Uint8Array {
  return new TextEncoder().encode(`\uFEFF${csv}`);
}

export interface ParsedCsv {
  data: Record<string, string>[];
  errors: string[];
}

export function parseCsvText(text: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return {
    data: result.data,
    errors: result.errors.map((e) => `行${(e.row ?? 0) + 2}: ${e.message}`),
  };
}

/** Decodes JSON stored in SQLite TEXT while also tolerating already-decoded values. */
export function csvRowData<T>(value: unknown): T {
  return (typeof value === "string" ? JSON.parse(value) : value) as T;
}
