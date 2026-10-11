// Source: Fix plan 2026-10-11, D7. Plain summaries, before and after previews, and per-change errors.
import type { Collection } from "@/lib/admin/collections";
import { describeChange, type CollectionChange, type CollectionRecord } from "@/lib/admin/collectionDraft";
import { ItemPreview } from "./ItemPreview";
import type { ReviewItem } from "./drafts/ReviewDialog";
import { previewFields, sameRecord, type DraftFiles } from "./drafts/collectionDisplay";

export function collectionReviewItems(collection: Collection, draft: CollectionChange[], records: CollectionRecord[], files: DraftFiles): ReviewItem[] {
  return draft.map((change) => {
    const before = records.find((record) => sameRecord(change, record));
    const after = { ...before?.fields, ...change.fields };
    const removed = change.action === "delete" || change.action === "hide";
    return {
      id: change.id, lines: [describeChange(collection, change, before)],
      before: before ? <ItemPreview collection={collection.id} values={before.fields} /> : <p className="text-fine text-ink-3">New record</p>,
      after: removed ? <p className="text-fine text-ink-3">{change.action === "delete" ? "Deleted" : "Hidden"}</p> : <ItemPreview collection={collection.id} values={previewFields(after, files)} />,
    };
  });
}
