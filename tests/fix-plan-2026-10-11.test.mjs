/*
  Fix plan of 11 October 2026 (docs/FIX_PLAN_2026-10-11.md): the dashboard
  crash fixes (D6) and the Design Studio photograph drafts (D2 and D7). Each
  test names the item it holds in place.
*/

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  changeCount, describe, persistable, restoreDraft, startingTiles, summarise, toChange,
} from "../lib/admin/studioDraft.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));

const area = {
  id: "electronics",
  name: "Electronics",
  at: "2026-10-06T09:00:00.000Z",
  photos: [
    { src: "/a.jpg", alt: "A", width: 4, height: 3 },
    { src: "/b.jpg", alt: "B", width: 4, height: 3 },
    { src: "/c.jpg", alt: "C", width: 4, height: 3 },
  ],
};

test("D6: the dashboard has an error boundary with Try again, a loading state, and the app a global one", () => {
  const boundary = read("app/admin/(secure)/error.tsx");
  assert.match(boundary, /^"use client";/);
  assert.match(boundary, /Try again/);
  assert.match(boundary, /onClick=\{\(\) => retry\(\)\}/);
  assert.ok(exists("app/admin/(secure)/loading.tsx"));
  assert.match(read("app/global-error.tsx"), /<html lang="en">/);
});

test("D6: one request reads the sheet once, and a cached read does not also fetch the tab list uncached", () => {
  const store = read("lib/admin/store.ts");
  assert.match(store, /const load = cache\(async/);
  assert.match(store, /turbopackIgnore: true/);
  assert.match(read("lib/admin/sheets.ts"), /await tabs\(cache\)/);
});

test("D6: a Sheets error is answered in the form, not thrown", () => {
  const actions = read("app/admin/actions.ts");
  assert.match(actions, /if \(!match\.ok\) return SHEET_BUSY;/);
  assert.match(actions, /if \(!existing\.ok\) return SHEET_BUSY;/);
});

test("D2: studio saves read fresh, upsert one row per area, and the newest row wins", () => {
  const store = read("lib/admin/store.ts");
  assert.match(store, /fresh \? loadFresh\(\) : load\(\)/);
  // Review 2026-10-11: one all-or-nothing request, removing only rows up to the version the editor loaded.
  assert.match(store, /await appendAndDelete\("studio", rows, \(entry\) => base\.has\(entry\.capability\) && \(entry\.at \?\? ""\) <= /);
  assert.doesNotMatch(store, /for \(const row of rows\) \{\s*await appendRow\("studio"/);
  const sheets = read("lib/admin/sheets.ts");
  assert.match(sheets, /deleteDimension[\s\S]*appendCells[\s\S]*await call\(":batchUpdate"/);
  assert.match(store, /result\[row\.capability\]\.at > \(row\.at \?\? ""\)/);
  assert.doesNotMatch(store, /updateRow\("studio"/);
});

test("D7: the studio save checks the version the draft was made from and names photographs by address only", () => {
  const actions = read("app/admin/studio-actions.ts");
  assert.match(actions, /studioPhotoLists\(true\)/);
  assert.match(actions, /\(saved\[area\]\?\.at \?\? ""\) !== String\(change\.base \?\? ""\)/);
  assert.match(actions, /const photo = known\.get\(entry\.src\)/);
  assert.doesNotMatch(actions, /export async function changeStudioPhotos|export async function addStudioPhoto/);
});

test("D7: an untouched area is not a change", () => {
  assert.equal(summarise(area, startingTiles(area)), null);
});

test("D7: a reorder reads as the old positions in their new order", () => {
  const [a, b, c] = startingTiles(area);
  const summary = summarise(area, [b, a, c]);
  assert.deepEqual(summary.order, ["2", "1", "3"]);
  assert.equal(changeCount(summary), 1);
  assert.deepEqual(describe("Electronics", summary), ["Electronics photographs. New order: 2, 1, 3"]);
});

test("D7: a delete is struck through, not a reorder of what follows", () => {
  const [a, b, c] = startingTiles(area);
  const summary = summarise(area, [{ ...a, deleted: true }, b, c]);
  assert.equal(summary.order, null);
  assert.equal(summary.removed.length, 1);
  assert.deepEqual(toChange(area, [{ ...a, deleted: true }, b, c]).photos, [{ src: "/b.jpg" }, { src: "/c.jpg" }]);
});

test("D7: a new photograph is sent by its file field, and is never kept in the browser", () => {
  const tiles = [...startingTiles(area), { key: "new:1", src: "blob:x", alt: "D", width: 4, height: 3, added: true }];
  assert.deepEqual(toChange(area, tiles).photos.at(-1), { file: "new:1", alt: "D", width: 4, height: 3 });
  const kept = persistable({ electronics: { at: area.at, photos: tiles } });
  assert.equal(kept.electronics.photos.length, 3);
});

test("D7: a kept draft comes back only while nobody has saved the area since", () => {
  const [a, b, c] = startingTiles(area);
  const saved = { electronics: { at: area.at, photos: [b, a, c] } };
  assert.deepEqual(Object.keys(restoreDraft([area], saved)), ["electronics"]);
  assert.equal(restoreDraft([{ ...area, at: "2026-10-11T10:00:00.000Z" }], saved), null);
  assert.equal(restoreDraft([area], { electronics: { at: area.at, photos: [b, a] } }), null);
});

test("D7: leaving with unsaved changes asks first", () => {
  const hook = read("components/admin/drafts/useDraft.ts");
  assert.match(hook, /addEventListener\("beforeunload"/);
  assert.match(hook, /document\.addEventListener\("click", click, true\)/);
});
