/*
  A small CSV reader for the published Google Sheet.

  Written rather than installed because post text routinely carries commas,
  quotes and line breaks, a naive split would corrupt it, and a dependency here
  would be a new supply-chain surface for forty lines of well-understood
  parsing.

  Follows RFC 4180: fields may be quoted, a doubled quote inside a quoted field
  is a literal quote, and CRLF and LF both end a record.
*/

export type CsvRow = Record<string, string>;

function splitRecords(input: string): string[][] {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      record.push(field);
      records.push(record);
      field = "";
      record = [];
    } else {
      field += char;
    }
  }

  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
}

/** Parses a CSV body into objects keyed by its header row. Rows with fewer
    cells than the header are padded, so a trailing empty column in the sheet
    does not drop a record. */
export function parseCsv(input: string): CsvRow[] {
  const records = splitRecords(input.replace(/^﻿/, ""));
  if (records.length < 2) return [];

  const header = records[0].map((cell) => cell.trim());

  return records.slice(1).flatMap((record) => {
    if (record.every((cell) => cell.trim() === "")) return [];
    const row: CsvRow = {};
    header.forEach((key, index) => {
      row[key] = (record[index] ?? "").trim();
    });
    return [row];
  });
}
