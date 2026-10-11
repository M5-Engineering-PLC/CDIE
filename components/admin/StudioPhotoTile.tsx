// Dashboard, Design Studio: one photograph in a workshop area's draft. Internal tooling.
/*
  Fix plan 2026-10-11, D2 and D7: tiles are dragged into order, with the arrow
  buttons kept for the keyboard. A change shows on the tile until it is saved:
  a new or moved photograph is tagged, and a deleted one is struck through and
  can be put back, not removed from sight.
*/

import type { DraftPhoto } from "@/lib/admin/studioDraft";

export type TileStatus = "new" | "moved" | "removed" | null;

const control = "grid h-9 w-9 place-items-center border border-line bg-surface text-ink-2 transition-colors hover:border-brand hover:text-brand disabled:opacity-30";
const icon = (d: string) => <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2"><path d={d} /></svg>;
const TAG: Record<Exclude<TileStatus, null>, string> = { new: "Not saved: new", moved: "Not saved: moved", removed: "Not saved: removed" };

export function StudioPhotoTile({ photo, status, leads, first, last, canRemove, pending, dragging, onMove, onRemove, onRestore, onDragStart, onDragEnd, onDrop }: {
  photo: DraftPhoto;
  status: TileStatus;
  leads: boolean;
  first: boolean;
  last: boolean;
  canRemove: boolean;
  pending: boolean;
  dragging: boolean;
  onMove: (step: -1 | 1) => void;
  onRemove: () => void;
  onRestore: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  const removed = status === "removed";
  return (
    <li
      draggable={!pending}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", photo.key);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={`flex cursor-grab flex-col border bg-surface ${status ? "border-brand" : "border-line"} ${dragging ? "opacity-40" : ""}`}
    >
      <div className={`relative aspect-[4/3] bg-raise ${removed ? "opacity-40" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- uploads and unsaved files, not optimised */}
        <img src={photo.src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        {leads ? <span className="absolute left-2 top-2 bg-brand px-2 py-0.5 text-fine text-surface">Leads</span> : null}
        {status ? <span className="absolute right-2 top-2 bg-surface px-2 py-0.5 text-fine text-brand">{TAG[status]}</span> : null}
      </div>
      <div className="flex items-center gap-2 p-3">
        <p className={`min-w-0 flex-1 truncate text-fine text-ink-2 ${removed ? "line-through" : ""}`} title={photo.alt}>{photo.alt}</p>
        {removed ? (
          <button type="button" onClick={onRestore} disabled={pending} className="text-fine text-brand hover:text-brand-live disabled:opacity-50">
            Put back
          </button>
        ) : (
          <>
            <button type="button" onClick={() => onMove(-1)} aria-label="Move earlier" title="Move earlier" disabled={pending || first} className={control}>{icon("M15 18l-6-6 6-6")}</button>
            <button type="button" onClick={() => onMove(1)} aria-label="Move later" title="Move later" disabled={pending || last} className={control}>{icon("M9 6l6 6-6 6")}</button>
            <button type="button" onClick={onRemove} aria-label="Delete photograph" title="Delete photograph" disabled={pending || !canRemove} className={control}>
              {icon("M5 7h14M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3")}
            </button>
          </>
        )}
      </div>
    </li>
  );
}
