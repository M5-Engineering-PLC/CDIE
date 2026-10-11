// Source: Fix plan 2026-10-11, D3 and D7. Drafted records stay visible; newsletter sending uses saved records only.
import type { Collection } from "@/lib/admin/collections";
import type { CollectionChange, CollectionRecord } from "@/lib/admin/collectionDraft";
import { ContentCard } from "./ContentCard";
import { ItemPreview } from "./ItemPreview";
import { SendIssue } from "./SendIssue";
import { draftKey, previewFields, sameRecord, type DraftFiles } from "./drafts/collectionDisplay";

export function CollectionCards({ collection, records, originals, draft, files, subscribers, pending, onEdit, onDelete, onVisibility }: {
  collection: Collection; records: CollectionRecord[]; originals: CollectionRecord[]; draft: CollectionChange[];
  files: DraftFiles; subscribers: number; pending: boolean;
  onEdit: (record: CollectionRecord) => void; onDelete: (record: CollectionRecord) => void; onVisibility: (record: CollectionRecord) => void;
}) {
  const removed = (record: CollectionRecord) => originals.find((item) => draftKey(item) === draftKey(record))?.hidden ?? false;
  return <>{[false, true].map((hidden) => {
    const shown = records.filter((record) => removed(record) === hidden);
    if (hidden && !shown.length) return null;
    return <section key={String(hidden)} className="flex flex-col gap-3">
      <h2 className="kicker">{hidden ? "Taken off the website" : "On the website now"}: {shown.length}</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((record) => {
          const values = previewFields(record.fields, files);
          const changes = draft.filter((change) => sameRecord(change, record));
          const deleted = changes.some((change) => change.action === "delete");
          return <ContentCard key={draftKey(record)} title={values[collection.titleField]} detail={[values.start ?? values.date, values.role ?? values.year ?? values.issue ?? values.venue].filter(Boolean).join(" · ")}
            image={values.image} source={record.source} hidden={record.hidden} changed={changes.length > 0} deleted={deleted} pending={pending}
            onEdit={() => onEdit(record)} onDelete={() => onDelete(record)} onVisibility={() => onVisibility(record)}>
            {values.pdf ? <a href={values.pdf} target="_blank" rel="noopener noreferrer" className="px-3 pb-2 text-fine text-brand">Open the PDF</a> : null}
            {collection.id === "newsletters" && record.source === "dashboard" && !record.hidden && changes.length === 0 ? <SendIssue id={record.id} subscribers={subscribers} sentAt={values.sentAt} sentCount={values.sentCount} disabled={pending} /> : null}
            <details className="border-t border-line-soft">
              <summary className="cursor-pointer px-3 py-2 text-fine text-brand">Preview on the site</summary>
              <div className="p-3 pt-0"><ItemPreview collection={collection.id} values={values} /></div>
            </details>
          </ContentCard>;
        })}
      </ul>
    </section>;
  })}</>;
}
