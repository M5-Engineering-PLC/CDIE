"use client";

// Dashboard, Design Studio: every workshop area's photographs, drafted, reviewed and saved as one set. Internal tooling.
/*
  Fix plan 2026-10-11, D2 and D7. Reordering, deleting and adding change only
  this page. Switching area keeps the draft, so one save can carry several
  areas. Save sends the set to publishStudioChanges, which writes each area
  once and refreshes the site once.
*/

import { useCallback, useState, useTransition } from "react";

import { publishStudioChanges } from "@/app/admin/studio-actions";
import { ChangesBar } from "@/components/admin/drafts/ChangesBar";
import { ReviewDialog } from "@/components/admin/drafts/ReviewDialog";
import { useDraft } from "@/components/admin/drafts/useDraft";
import { StudioPhotoAdd, type NewPhoto } from "@/components/admin/StudioPhotoAdd";
import { StudioPhotoTile, type TileStatus } from "@/components/admin/StudioPhotoTile";
import { studioReviewItems } from "@/components/admin/StudioReviewItems";
import {
  changeCount, persistable, restoreDraft, startingTiles, summarise, tilesOf, toChange,
  type AreaSummary, type DraftPhoto, type StudioArea, type StudioDraft,
} from "@/lib/admin/studioDraft";

const EMPTY: StudioDraft = {};
const isEmpty = (draft: StudioDraft) => Object.keys(draft).length === 0;
const forget = (tiles: DraftPhoto[]) => tiles.filter((tile) => tile.added).forEach((tile) => URL.revokeObjectURL(tile.src));

export function StudioPhotoEditor({ areas, initialArea, scope }: { areas: StudioArea[]; initialArea: string; scope: string }) {
  const restore = useCallback((saved: unknown) => restoreDraft(areas, saved), [areas]);
  const { draft, change, clear } = useDraft(`${scope}:studio`, { empty: EMPTY, isEmpty, persist: persistable, restore });
  const [selectedId, setSelectedId] = useState(initialArea);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<{ message: string; area?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const area = areas.find((item) => item.id === selectedId) ?? areas[0];
  const tiles = tilesOf(area, draft);
  const changed = areas.flatMap((item) => {
    const summary = summarise(item, tilesOf(item, draft));
    return summary ? [{ area: item, summary }] : ([] as { area: StudioArea; summary: AreaSummary }[]);
  });
  const count = changed.reduce((sum, entry) => sum + changeCount(entry.summary), 0);

  const setTiles = (target: StudioArea, next: DraftPhoto[]) => {
    const rest = Object.fromEntries(Object.entries(draft).filter(([id]) => id !== target.id));
    change(summarise(target, next) ? { ...rest, [target.id]: { at: target.at, photos: next } } : rest);
    setError(null);
  };
  const move = (from: number, to: number) => {
    if (from < 0 || to < 0 || to >= tiles.length || from === to) return;
    const next = [...tiles];
    next.splice(to, 0, ...next.splice(from, 1));
    setTiles(area, next);
  };
  const remove = (index: number) => {
    const tile = tiles[index];
    if (tile.added) forget([tile]);
    setTiles(area, tile.added ? tiles.filter((_, at) => at !== index) : tiles.map((item, at) => (at === index ? { ...item, deleted: true } : item)));
  };
  const putBack = (index: number) => setTiles(area, tiles.map((item, at) => (at === index ? { ...item, deleted: false } : item)));
  const add = (photo: NewPhoto) => {
    const key = `new:${crypto.randomUUID()}`;
    setFiles({ ...files, [key]: photo.file });
    setTiles(area, [...tiles, { key, src: photo.url, alt: photo.alt, width: photo.width, height: photo.height, added: true }]);
  };
  const undo = (id: string) => {
    const target = areas.find((item) => item.id === id);
    if (!target) return;
    forget(tilesOf(target, draft));
    setTiles(target, startingTiles(target));
    if (changed.length === 1) setReviewing(false);
  };
  const discard = () => {
    if (!window.confirm("Discard every change that is not saved?")) return;
    areas.forEach((item) => forget(tilesOf(item, draft)));
    clear();
    setFiles({});
    setError(null);
  };
  const select = (id: string) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `?area=${id}`);
  };
  const save = () => {
    const changes = changed.map((entry) => toChange(entry.area, tilesOf(entry.area, draft)));
    const form = new FormData();
    form.set("changes", JSON.stringify(changes));
    changes.flatMap((item) => item.photos).forEach((photo) => { if ("file" in photo && files[photo.file]) form.set(photo.file, files[photo.file]); });
    startTransition(async () => {
      const result = await publishStudioChanges(form);
      if (result) return setError({ message: result.error, area: result.area });
      areas.forEach((item) => forget(tilesOf(item, draft)));
      clear();
      setFiles({});
      setError(null);
      setReviewing(false);
    });
  };

  // A tile counts as moved when it is out of step with the other photographs that were already there.
  const original = startingTiles(area).map((tile) => tile.key);
  const kept = tiles.filter((tile) => !tile.deleted && !tile.added).map((tile) => tile.key);
  const settled = [...kept].sort((a, b) => original.indexOf(a) - original.indexOf(b));
  const statusOf = (tile: DraftPhoto): TileStatus =>
    tile.deleted ? "removed" : tile.added ? "new" : kept.indexOf(tile.key) !== settled.indexOf(tile.key) ? "moved" : null;
  const leadKey = tiles.find((tile) => !tile.deleted)?.key;
  const keptCount = tiles.filter((tile) => !tile.deleted).length;

  return (
    <>
      <nav aria-label="Workshop areas" className="flex flex-wrap gap-2">
        {areas.map((item) => {
          const shown = tilesOf(item, draft).filter((tile) => !tile.deleted).length;
          const dirty = changed.some((entry) => entry.area.id === item.id);
          return (
            <button key={item.id} type="button" onClick={() => select(item.id)} aria-pressed={item.id === area.id}
              className={`border px-3 py-1.5 text-fine transition-colors ${item.id === area.id ? "border-brand bg-brand text-surface" : "border-line bg-surface text-ink-2 hover:border-brand"}`}>
              {item.name} <span className="opacity-70">({shown}){dirty ? ", not saved" : ""}</span>
            </button>
          );
        })}
      </nav>

      <section aria-label={`${area.name} photographs`} className="flex flex-col gap-3">
        <h2 className="kicker">{area.name}: {keptCount} photograph{keptCount === 1 ? "" : "s"}</h2>
        <p className="text-fine text-ink-3">Drag a photograph to change the order, or use the arrows.</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile, index) => (
            <StudioPhotoTile key={tile.key} photo={tile} status={statusOf(tile)} leads={tile.key === leadKey}
              first={index === 0} last={index === tiles.length - 1} canRemove={tile.added === true || keptCount > 1} pending={pending}
              dragging={dragKey === tile.key} onMove={(step) => move(index, index + step)} onRemove={() => remove(index)}
              onRestore={() => putBack(index)} onDragStart={() => setDragKey(tile.key)} onDragEnd={() => setDragKey(null)}
              onDrop={() => move(tiles.findIndex((item) => item.key === dragKey), index)} />
          ))}
          <li><StudioPhotoAdd key={area.id} name={area.name} disabled={pending} onAdd={add} /></li>
        </ul>
      </section>

      <ChangesBar count={count} pending={pending} onDiscard={discard} onReview={() => setReviewing(true)} />
      <ReviewDialog open={reviewing && count > 0} items={studioReviewItems(changed, draft)} pending={pending}
        error={error?.message ?? null} errorFor={error?.area} onUndo={undo} onSave={save} onClose={() => setReviewing(false)} />
    </>
  );
}
