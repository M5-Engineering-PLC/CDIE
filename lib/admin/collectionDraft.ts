/* Fix plan 2026-10-11, D1, D3 and D7: shared draft descriptions, validation and record comparisons. */
import type { Collection } from "./collections.ts";
import { linkedInUrn } from "../linkedin/links.ts";

export type Fields = Record<string, string>;
export type CollectionRecord = { id: string; source: "site" | "dashboard"; fields: Fields; base: string; hidden: boolean; original?: Fields };
export type CollectionChange = {
  id: string; recordId: string; source: "site" | "dashboard"; base: string;
  action: "add" | "edit" | "delete" | "hide" | "restore"; fields?: Fields;
};
export type UploadInfo = { name: string; type: string; size: number };
export type ChangeError = { error: string; changeId?: string };
export type ValidatedChange = CollectionChange & { fields: Fields; before?: CollectionRecord; summary: string };

export function recordStamp(fields: Fields, hidden: boolean, at = ""): string {
  return JSON.stringify({ fields: Object.fromEntries(Object.entries(fields).sort(([a], [b]) => a.localeCompare(b))), hidden, at });
}

export function linkedInLink(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.port || url.protocol !== "https:") return false;
    // Keep the post parser's check, and also accept the official short-link and other LinkedIn paths.
    return (url.hostname === "www.linkedin.com" && (linkedInUrn(value) !== null || value.startsWith("https://www.linkedin.com/")))
      || (url.hostname === "lnkd.in" && value.startsWith("https://lnkd.in/"));
  } catch { return false; }
}

export function validateFields(collection: Collection, input: Fields, uploads: Record<string, UploadInfo> = {}, before: Fields = {}): { fields: Fields } | { error: string } {
  if (Object.keys(input).some((name) => !collection.fields.some((field) => field.name === name))) return { error: "An unknown field was sent." };
  const fields: Fields = {};
  for (const field of collection.fields) {
    const raw = input[field.name] ?? before[field.name] ?? "";
    if (typeof raw !== "string") return { error: `${field.label} could not be read.` };
    fields[field.name] = raw.trim().slice(0, field.type === "textarea" ? 4000 : 300);
    if (field.type === "image" || field.type === "pdf") {
      const upload = uploads[raw];
      if (raw.startsWith("new:")) {
        if (!upload?.size) return { error: `${field.label} needs to be chosen again after a reload.` };
        const fits = field.type === "pdf" ? upload.type === "application/pdf" : /^image\/(jpeg|png|webp|gif|avif)$/.test(upload.type);
        if (!fits) return { error: `${field.label} must be ${field.type === "pdf" ? "a PDF" : "a JPEG, PNG, WebP, GIF or AVIF image"}.` };
      } else if (raw && raw !== before[field.name]) return { error: `${field.label} must be chosen as a file.` };
    }
    if (field.required && !fields[field.name]) return { error: `${field.label} is required.` };
    if (field.type === "date" && fields[field.name]) {
      const date = fields[field.name];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) return { error: `${field.label} needs a valid date.` };
    }
    if (field.type === "url" && fields[field.name]) {
      const value = fields[field.name];
      if (field.name === "link" && (collection.id === "events" || collection.id === "activities")) {
        if (!linkedInLink(value)) return { error: "LinkedIn post link must start with https://www.linkedin.com/ or https://lnkd.in/." };
      } else {
        try { if (!["https:", "http:"].includes(new URL(value).protocol)) return { error: `${field.label} needs an HTTP or HTTPS link.` }; }
        catch { return { error: `${field.label} needs a valid link.` }; }
      }
    }
  }
  if (fields.end && fields.start && fields.end < fields.start) return { error: "The end date is before the start date." };
  return { fields };
}

export function describeChange(collection: Collection, change: CollectionChange, before?: CollectionRecord): string {
  const title = change.fields?.[collection.titleField] ?? before?.fields[collection.titleField] ?? change.recordId;
  if (change.action === "add") return `Added ${collection.singular}: ${title}`;
  if (change.action === "edit") {
    const changed = collection.fields.filter((field) => field.name in (change.fields ?? {}) && change.fields?.[field.name] !== before?.fields[field.name]);
    return `Changed ${collection.id}: ${changed.map((field) => field.label.toLowerCase()).join(", ")} of ${title}`;
  }
  return `${{ delete: "Deleted", hide: "Hid", restore: "Restored" }[change.action]} ${title}`;
}

export function validateChanges(collection: Collection, changes: CollectionChange[], records: CollectionRecord[], uploads: Record<string, UploadInfo> = {}): { plans: ValidatedChange[] } | ChangeError {
  if (!Array.isArray(changes) || changes.length === 0 || changes.length > 200) return { error: "Send between 1 and 200 changes." };
  const seen = new Set<string>();
  const plans: ValidatedChange[] = [];
  for (const change of changes) {
    if (!change || typeof change !== "object" || typeof change.id !== "string") return { error: "A change could not be read." };
    const fail = (error: string): ChangeError => ({ error, changeId: change.id });
    if (!["add", "edit", "delete", "hide", "restore"].includes(change.action) || !["site", "dashboard"].includes(change.source) || typeof change.recordId !== "string" || !/^[\w:-]{1,120}$/.test(change.recordId)) return fail("A change is not recognised.");
    const key = `${change.source}:${change.recordId}:${change.action === "edit" || change.action === "add" ? "fields" : "visibility"}`;
    if (seen.has(key)) return fail("A record was sent more than once for the same change.");
    seen.add(key);
    const added = plans.find((plan) => plan.action === "add" && plan.recordId === change.recordId && plan.source === change.source);
    const before = records.find((record) => record.id === change.recordId && record.source === change.source)
      ?? (added ? { id: added.recordId, source: added.source, fields: added.fields, hidden: false, base: "" } : undefined);
    if (change.action === "add") {
      if (before || change.source !== "dashboard" || change.base !== "") return fail("That record already exists. Reload the page.");
    } else if (!before || before.base !== change.base) return fail("Someone changed this record after you opened the page. Reload the page and make your changes again.");
    if (change.action === "delete" && change.source === "site") return fail("A built-in record can only be hidden.");
    if ((change.action === "hide" && before?.hidden) || (change.action === "restore" && !before?.hidden)) return fail("The visibility changed. Reload the page.");
    let fields: Fields = {};
    if (change.action === "add" || change.action === "edit") {
      if (!change.fields || typeof change.fields !== "object" || Array.isArray(change.fields)) return fail("The fields could not be read.");
      const result = validateFields(collection, change.fields, uploads, before?.fields);
      if ("error" in result) return fail(result.error);
      fields = change.action === "add" ? result.fields : Object.fromEntries(Object.entries(result.fields).filter(([name, value]) => value !== (before?.fields[name] ?? "")));
      if (change.action === "edit" && Object.keys(fields).length === 0) return fail("This record has no changed fields.");
    }
    plans.push({ ...change, fields, before, summary: describeChange(collection, { ...change, fields }, before) });
  }
  return { plans };
}


export class CollectionConflict extends Error {
  changeId: string;
  constructor(changeId: string) {
    super("Someone changed this record after you opened the page. Reload the page and make your changes again.");
    this.changeId = changeId;
  }
}
