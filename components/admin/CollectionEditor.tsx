"use client";

// Source: Fix plan 2026-10-11, D3 and D7. Collection changes stay local until Review changes and Save now.
import { useEffect, useRef, useState, useTransition } from "react";
import { publishChanges } from "@/app/admin/collection-actions";
import type { Collection } from "@/lib/admin/collections";
import { validateChanges, validateFields, type CollectionChange, type CollectionRecord, type Fields, type ChangeError } from "@/lib/admin/collectionDraft";
import { CollectionCards } from "./CollectionCards";
import { collectionReviewItems } from "./CollectionReviewItems";
import { ItemForm } from "./ItemForm";
import { ChangesBar } from "./drafts/ChangesBar";
import { ReviewDialog } from "./drafts/ReviewDialog";
import { useDraft } from "./drafts/useDraft";
import { draftKey, draftRecords, persistChanges, previewFields, restoreChanges, sameRecord, type DraftFiles } from "./drafts/collectionDisplay";

const EMPTY: CollectionChange[] = [];
const isEmpty = (draft: CollectionChange[]) => draft.length === 0;

export function CollectionEditor({ collection, records, subscribers, scope }: { collection: Collection; records: CollectionRecord[]; subscribers: number; scope: string }) {
  const { draft, change, clear } = useDraft(`${scope}:${collection.id}`, { empty: EMPTY, isEmpty, persist: persistChanges, restore: restoreChanges });
  const [files, setFiles] = useState<DraftFiles>({});
  const fileRef = useRef<DraftFiles>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<ChangeError | null>(null);
  const [pending, startTransition] = useTransition();
  useEffect(() => () => Object.values(fileRef.current).forEach((entry) => URL.revokeObjectURL(entry.url)), []);
  const current = draftRecords(records, draft);
  const selected = current.find((record) => draftKey(record) === editing);
  const keepFiles = (next: CollectionChange[]) => {
    const used = new Set(next.flatMap((entry) => Object.values(entry.fields ?? {})));
    const kept = Object.fromEntries(Object.entries(fileRef.current).filter(([key, entry]) => {
      if (used.has(key)) return true;
      URL.revokeObjectURL(entry.url);
      return false;
    }));
    fileRef.current = kept;
    setFiles(kept);
  };
  const setDraft = (next: CollectionChange[]) => { change(next); keepFiles(next); setError(null); };
  const undo = (id: string) => setDraft(draft.filter((entry) => entry.id !== id));
  const edit = (record: CollectionRecord) => { setEditing(draftKey(record)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const draftFields = (fields: Fields, added: Record<string, File>) => {
    const allFiles = { ...Object.fromEntries(Object.entries(files).map(([key, entry]) => [key, entry.file])), ...added };
    const original = records.find((record) => draftKey(record) === editing);
    const result = validateFields(collection, fields, allFiles, original?.fields);
    if ("error" in result) return result.error;
    for (const [key, file] of Object.entries(added)) fileRef.current[key] = { file, url: URL.createObjectURL(file) };
    const recordId = selected?.id ?? crypto.randomUUID();
    const source = selected?.source ?? "dashboard";
    const existingAdd = draft.find((entry) => entry.action === "add" && entry.recordId === recordId);
    const action = original ? "edit" : "add";
    const patch = original ? Object.fromEntries(Object.entries(result.fields).filter(([name, value]) => value !== (original.fields[name] ?? ""))) : result.fields;
    const id = existingAdd?.id ?? `${source}:${recordId}:fields`;
    const rest = draft.filter((entry) => entry.id !== id);
    setDraft(Object.keys(patch).length ? [...rest, { id, recordId, source, base: original?.base ?? "", action, fields: patch }] : rest);
    setEditing(null);
    setFormVersion(formVersion + 1);
    return null;
  };
  const visibility = (record: CollectionRecord) => {
    const original = records.find((item) => sameRecord({ recordId: record.id, source: record.source } as CollectionChange, item));
    const id = `${draftKey(record)}:visibility`;
    const rest = draft.filter((entry) => entry.id !== id);
    setDraft(!record.hidden === (original?.hidden ?? false) ? rest : [...rest, { id, recordId: record.id, source: record.source, base: record.base, action: record.hidden ? "restore" : "hide" }]);
  };
  const remove = (record: CollectionRecord) => {
    const id = `${draftKey(record)}:visibility`;
    if (draft.some((entry) => entry.id === id && entry.action === "delete")) return undo(id);
    if (draft.some((entry) => sameRecord(entry, record) && entry.action === "add")) return setDraft(draft.filter((entry) => !sameRecord(entry, record)));
    setDraft([...draft.filter((entry) => entry.id !== id), { id, recordId: record.id, source: record.source, base: record.base, action: "delete" }]);
  };
  const discard = () => {
    if (!window.confirm("Discard every change that is not saved?")) return;
    clear(); keepFiles([]); setError(null); setEditing(null);
  };
  const save = () => {
    const fileValues = Object.fromEntries(Object.entries(files).map(([key, entry]) => [key, entry.file]));
    const result = validateChanges(collection, draft, records, fileValues);
    if ("error" in result) return setError(result);
    const form = new FormData();
    form.set("changes", JSON.stringify(draft));
    Object.entries(fileValues).forEach(([key, file]) => form.set(key, file));
    startTransition(async () => {
      try {
        const result = await publishChanges(collection.id, form);
        if (result) return setError(result);
        clear(); keepFiles([]); setError(null); setReviewing(false); setEditing(null); setFormVersion(formVersion + 1);
      } catch { setError({ error: "Save did not finish. Reload the page to see what saved before trying again." }); }
    });
  };
  return <>
    <section className="flex flex-col gap-4">
      <h2 className="kicker">{selected ? `Edit ${selected.fields[collection.titleField]}` : `Add a ${collection.singular}`}</h2>
      <ItemForm key={`${editing ?? "add"}:${formVersion}`} collection={collection} initial={selected?.fields} preview={selected ? previewFields(selected.fields, files) : undefined}
        editing={Boolean(selected)} disabled={pending} onDraft={draftFields} onCancel={() => setEditing(null)} />
    </section>
    <CollectionCards collection={collection} records={current} originals={records} draft={draft} files={files} subscribers={subscribers} pending={pending} onEdit={edit} onDelete={remove} onVisibility={visibility} />
    <ChangesBar count={draft.length} pending={pending} onDiscard={discard} onReview={() => setReviewing(true)} />
    <ReviewDialog open={reviewing && draft.length > 0} items={collectionReviewItems(collection, draft, records, files)} pending={pending}
      error={error?.error ?? null} errorFor={error?.changeId} onUndo={undo} onSave={save} onClose={() => setReviewing(false)} />
  </>;
}
