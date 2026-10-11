/* Fix plan 2026-10-11, D7: previews and persisted drafts never contain file bytes. */
import type { CollectionChange, CollectionRecord, Fields } from "@/lib/admin/collectionDraft";

export type DraftFile = { file: File; url: string };
export type DraftFiles = Record<string, DraftFile>;
export const draftKey = (record: Pick<CollectionRecord, "id" | "source">) => `${record.source}:${record.id}`;
export const sameRecord = (change: CollectionChange, record: CollectionRecord) => change.recordId === record.id && change.source === record.source;
export function draftRecords(records: CollectionRecord[], draft: CollectionChange[]): CollectionRecord[] {
  const added = draft.filter((change) => change.action === "add").map((change): CollectionRecord => ({ id: change.recordId, source: "dashboard", base: "", hidden: false, fields: change.fields ?? {} }));
  return [...added, ...records].map((record) => draft.filter((change) => sameRecord(change, record)).reduce((current, change) => ({
    ...current, fields: change.action === "edit" || change.action === "add" ? { ...current.fields, ...change.fields } : current.fields,
    hidden: change.action === "hide" ? true : change.action === "restore" ? false : current.hidden,
  }), record));
}
export function previewFields(fields: Fields, files: DraftFiles): Fields {
  return Object.fromEntries(Object.entries(fields).map(([name, value]) => [name, value.startsWith("new:") ? files[value]?.url ?? "" : value]));
}
export const persistChanges = (draft: CollectionChange[]) => draft;
export function restoreChanges(saved: unknown): CollectionChange[] | null {
  if (!Array.isArray(saved) || saved.length === 0) return null;
  return saved.every((change) => change && typeof change.id === "string" && typeof change.recordId === "string" && typeof change.base === "string" && ["add", "edit", "delete", "hide", "restore"].includes(change.action) && ["site", "dashboard"].includes(change.source) && (!change.fields || Object.values(change.fields).every((value) => typeof value === "string" && !value.startsWith("blob:")))) ? saved : null;
}
