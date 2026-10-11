/* Fix plan 2026-10-11, D3: newest field overrides win without changing the built-in records. */
import type { CollectionId } from "./collections.ts";

export type OverrideRecord = { collection: string; key: string; fields: string; at: string };
export type FieldOverrides = Record<string, { fields: Record<string, string>; at: string }>;

export function newestOverrides(collection: string, rows: OverrideRecord[]): FieldOverrides {
  const result: FieldOverrides = {};
  for (const row of rows) {
    if (row.collection !== collection || (result[row.key]?.at ?? "") > row.at) continue;
    try {
      const fields: unknown = JSON.parse(row.fields);
      if (!fields || typeof fields !== "object" || Array.isArray(fields)) continue;
      result[row.key] = { fields: Object.fromEntries(Object.entries(fields).filter(([, value]) => typeof value === "string")), at: row.at };
    } catch { /* An unreadable row does not replace a readable override. */ }
  }
  return result;
}

/* The form uses image, year, summary and pdf; the original content uses these shapes. */
export function mergeOverride<T extends object>(collection: CollectionId, record: T, fields: Record<string, string>): T {
  const next: Record<string, unknown> = { ...record, ...fields };
  const original = record as Record<string, unknown>;
  if (collection === "staff") {
    if ("image" in fields) next.portrait = fields.image ? { ...(original.portrait as object ?? { width: 600, height: 720 }), src: fields.image, alt: String(next.name) } : undefined;
    else if ("name" in fields && original.portrait) next.portrait = { ...original.portrait as object, alt: fields.name };
    delete next.image;
  }
  if (collection === "cohorts") {
    if ("year" in fields) next.cohort = fields.year;
    if ("summary" in fields) next.quote = fields.summary || undefined;
    if ("name" in fields || "image" in fields) next.alt = String(next.name);
    delete next.year;
    delete next.summary;
  }
  if (collection === "newsletters") {
    if ("image" in fields) next.cover = fields.image ? { ...(original.cover as object ?? {}), src: fields.image, alt: String(next.title) } : undefined;
    if ("pdf" in fields) next.external = fields.pdf;
    delete next.image;
    delete next.pdf;
  }
  return next as T;
}

export function mergeOverrides<T extends object>(collection: CollectionId, records: readonly T[], keyOf: (record: T) => string, rows: OverrideRecord[]): T[] {
  const overrides = newestOverrides(collection, rows);
  return records.map((record) => mergeOverride(collection, record, overrides[keyOf(record)]?.fields ?? {}));
}
