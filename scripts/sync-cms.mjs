// Pulls the dashboard's Google Sheet into content/cms-snapshot.json.
// Run by .github/workflows/sync-cms.yml; needs Node 22.18 or later for type stripping.
/*
  Only the public collections are written. Newsletter subscribers and enquiry
  counts stay in the sheet: an email address does not belong in a repository.
  Review 2026-09-30: the hidden list and the studio photograph lists are site
  configuration, so they are written too. Enquiries (now with name, address
  and message) and admin accounts never are.
  The file is rewritten only when the content changed, so an unchanged sheet
  makes no commit and no deploy.
*/

import { readFile, writeFile } from "node:fs/promises";

import { collections } from "../lib/admin/collections.ts";
import { readTabs, sheetCredentials } from "../lib/admin/sheets.ts";

const target = new URL("../content/cms-snapshot.json", import.meta.url);

if (!sheetCredentials()) {
  console.error("GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY must be set.");
  process.exit(1);
}

const rows = await readTabs([...collections.map((item) => item.id), "hidden", "studio"]);
const items = Object.fromEntries(
  collections.map(({ id }) => [
    id,
    rows[id]
      .filter((row) => row.id)
      .map((row) => Object.fromEntries(Object.entries(row).filter(([, value]) => value !== "")))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
  ]),
);

const hidden = rows.hidden
  .filter((row) => row.collection && row.key)
  .map(({ collection, key, at }) => ({ collection, key, at }));
const studio = rows.studio
  .filter((row) => row.capability)
  .map(({ capability, photos, at }) => ({ capability, photos, at }));

const previous = JSON.parse(await readFile(target, "utf8").catch(() => "{}"));
const same = (a, b) => JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
if (same(previous.items ?? {}, items) && same(previous.hidden, hidden) && same(previous.studio, studio)) {
  console.log("Snapshot already current.");
  process.exit(0);
}

const snapshot = { syncedAt: new Date().toISOString(), items, hidden, studio, subscriptions: [], enquiries: [] };
await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Snapshot updated: ${collections.map(({ id }) => `${id} ${items[id].length}`).join(", ")}`);
