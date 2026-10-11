/*
  Dashboard, Design Studio photographs drafted before they are saved.

  Fix plan 2026-10-11, D2 and D7: a reorder, a delete or a new photograph
  changes only the page until the editor reviews the set and saves it. This
  file is the draft's shape and the rules for reading it. The page and the save
  action both use it, so it imports nothing.
*/

export type Photo = { src: string; alt: string; width: number; height: number };

/** One workshop area as the page loaded it. `at` is the saved version, "" while the site's own list stands. */
export type StudioArea = { id: string; name: string; at: string; photos: Photo[] };

/** One tile in a draft. `key` stays with the tile as it moves; an added one names its file in the save form. */
export type DraftPhoto = Photo & { key: string; added?: boolean; deleted?: boolean };

/** The areas an editor has changed, by id, each with the version it was drafted from. */
export type StudioDraft = Record<string, { at: string; photos: DraftPhoto[] }>;

/** What the save action receives for one area: the photographs to keep, in order. */
export type StudioChange = {
  capability: string;
  base: string;
  photos: ({ src: string } | { file: string; alt: string; width: number; height: number })[];
};

export const startingTiles = (area: StudioArea): DraftPhoto[] =>
  area.photos.map((photo, index) => ({ ...photo, key: `${index}:${photo.src}` }));

export const tilesOf = (area: StudioArea, draft: StudioDraft): DraftPhoto[] => draft[area.id]?.photos ?? startingTiles(area);

export type AreaSummary = {
  /** The new order as the old positions, 1 first, "new" for an added photograph; null when unchanged. */
  order: string[] | null;
  removed: DraftPhoto[];
  added: DraftPhoto[];
};

export function summarise(area: StudioArea, tiles: DraftPhoto[]): AreaSummary | null {
  const original = startingTiles(area).map((tile) => tile.key);
  const kept = tiles.filter((tile) => !tile.deleted);
  const removed = tiles.filter((tile) => tile.deleted && !tile.added);
  const added = kept.filter((tile) => tile.added);
  const labels = kept.map((tile) => (tile.added ? "new" : String(original.indexOf(tile.key) + 1)));
  const settled = [...labels.filter((label) => label !== "new").sort((a, b) => Number(a) - Number(b)), ...added.map(() => "new")];
  const order = labels.some((label, index) => label !== settled[index]) ? labels : null;
  return order || removed.length > 0 || added.length > 0 ? { order, removed, added } : null;
}

export const changeCount = (summary: AreaSummary) => (summary.order ? 1 : 0) + summary.removed.length + summary.added.length;

/** The review's wording for one area's changes. */
export function describe(name: string, summary: AreaSummary): string[] {
  return [
    ...(summary.order ? [`New order: ${summary.order.join(", ")}`] : []),
    ...summary.removed.map((tile) => `Removed: ${tile.alt}`),
    ...summary.added.map((tile) => `Added: ${tile.alt}`),
  ].map((line) => `${name} photographs. ${line}`);
}

export function toChange(area: StudioArea, tiles: DraftPhoto[]): StudioChange {
  return {
    capability: area.id,
    base: area.at,
    photos: tiles
      .filter((tile) => !tile.deleted)
      .map((tile) => (tile.added ? { file: tile.key, alt: tile.alt, width: tile.width, height: tile.height } : { src: tile.src })),
  };
}

/** What is kept in the browser: everything but new photographs, whose files cannot be stored there. */
export function persistable(draft: StudioDraft): StudioDraft {
  return Object.fromEntries(
    Object.entries(draft).map(([id, area]) => [id, { ...area, photos: area.photos.filter((tile) => !tile.added) }]),
  );
}

/*
  A draft kept in the browser comes back only for areas nobody has saved since
  it was made, and only if every photograph it names is still there. Anything
  else is dropped rather than written over someone else's save.
*/
export function restoreDraft(areas: StudioArea[], saved: unknown): StudioDraft | null {
  if (!saved || typeof saved !== "object") return null;
  const result: StudioDraft = {};
  for (const area of areas) {
    const entry = (saved as StudioDraft)[area.id];
    if (!entry || entry.at !== area.at || !Array.isArray(entry.photos)) continue;
    const known = new Map(startingTiles(area).map((tile) => [tile.key, tile]));
    if (entry.photos.length !== known.size || !entry.photos.every((tile) => known.has(tile?.key))) continue;
    const photos = entry.photos.map((tile) => ({ ...known.get(tile.key)!, deleted: tile.deleted === true }));
    if (summarise(area, photos)) result[area.id] = { at: area.at, photos };
  }
  return Object.keys(result).length > 0 ? result : null;
}
