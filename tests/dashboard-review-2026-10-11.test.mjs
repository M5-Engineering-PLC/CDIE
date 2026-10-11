/* Fix plan 2026-10-11, D1, D3, D4 and D7: software tests of publication, local storage and field overrides. */
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import { collections, collectionById } from "../lib/admin/collections.ts";
import * as draft from "../lib/admin/collectionDraft.ts";
import * as overrides from "../lib/admin/overrides.ts";
import { auditEntry } from "../lib/admin/auditFields.ts";

const require = createRequire(import.meta.url);
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
function load(file, dependencies) {
  const source = ts.transpileModule(read(file), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const sandbox = { exports: {} };
  runInNewContext(`(function(require,module,exports){${source}\n})`, { console, process, Buffer, File, FormData, URL, setTimeout })(
    (name) => { if (name in dependencies) return dependencies[name]; if (name.startsWith("node:")) return require(name); throw new Error(`Unstubbed import: ${name}`); }, sandbox, sandbox.exports,
  );
  return sandbox.exports;
}

const event = { id: "saved-event", title: "Saved event", start: "2026-10-11", createdAt: "2026-10-10T12:00:00.000Z" };
const record = (fields = event) => ({ id: fields.id, source: "dashboard", fields, hidden: false, base: draft.recordStamp(fields, false) });
const add = (id, fields = { title: "Draft event", start: "2026-10-12" }) => ({ id: `${id}:fields`, recordId: id, source: "dashboard", base: "", action: "add", fields });
const edit = (fields = { title: "Edited event" }, base = record().base) => ({ id: "saved-event:fields", recordId: event.id, source: "dashboard", base, action: "edit", fields });
const form = (changes) => { const value = new FormData(); value.set("changes", JSON.stringify(changes)); return value; };

async function harness(t) {
  const directory = await mkdtemp(path.join(tmpdir(), "cdie-dashboard-review-"));
  const previous = process.env.CMS_DATA_DIR;
  process.env.CMS_DATA_DIR = directory;
  t.after(async () => { if (previous === undefined) delete process.env.CMS_DATA_DIR; else process.env.CMS_DATA_DIR = previous; await rm(directory, { recursive: true, force: true }); });
  const initial = { items: { events: [event] }, hidden: [], overrides: [], studio: [], enquiries: [], subscriptions: [] };
  const file = path.join(directory, "cms.json");
  await writeFile(file, JSON.stringify(initial));
  const counts = { dispatch: 0, tags: 0, upload: 0, auth: 0 };
  const sheets = { sheetsConfigured: () => false };
  const store = load("lib/admin/store.ts", {
    "next/cache": { unstable_cache: (fn) => fn }, react: { cache: (fn) => fn },
    "@/content/cms-snapshot.json": initial, "./collections": { collections }, "./overrides": overrides, "./collectionDraft": draft,
    "./sheets": sheets, "./github": { commitUpload: async () => false, notifyContentChanged: async () => { counts.dispatch++; } },
  });
  const records = async (collection) => {
    const data = await store.collectionData(collection, true);
    return data.items.map((fields) => ({ ...record(fields), base: draft.recordStamp(fields, data.hidden.some((row) => row.key === fields.id), data.hidden.filter((row) => row.key === fields.id).map((row) => row.at).sort().join(",")), hidden: data.hidden.some((row) => row.key === fields.id) }));
  };
  const actions = load("app/admin/collection-actions.ts", {
    "next/cache": { updateTag: () => { counts.tags++; }, revalidatePath: () => {} },
    "@/lib/admin/audit": { auditWho: async () => "editor@example.test", audit: async (input, entries) => { entries.push(auditEntry(input)); } },
    "@/lib/admin/auth": { requireAdmin: async () => { counts.auth++; } },
    "@/lib/admin/builtins": { collectionRecords: records }, "@/lib/admin/collections": { onDashboard: collectionById },
    "@/lib/admin/collectionDraft": draft, "@/lib/admin/github": { notifyContentChanged: async () => { counts.dispatch++; } },
    "@/lib/admin/store": { ...store, saveUpload: async (file) => { counts.upload++; return store.saveUpload(file); } },
  });
  return { actions, store, counts, file, read: async () => JSON.parse(await readFile(file, "utf8")) };
}

test("software D7: invalid second change saves nothing and does not upload, audit, refresh or dispatch", async (t) => {
  const h = await harness(t);
  const before = await readFile(h.file, "utf8");
  const data = form([add("new-event", { title: "New event", start: "2026-10-11", image: "new:image" }), add("invalid", { title: "" })]);
  data.set("new:image", new File(["image bytes"], "photo.png", { type: "image/png" }));
  const error = await h.actions.publishChanges("events", data);
  assert.equal(error.changeId, "invalid:fields");
  assert.match(error.error, /Title is required/);
  assert.equal(await readFile(h.file, "utf8"), before);
  assert.deepEqual(h.counts, { auth: 1, upload: 0, tags: 0, dispatch: 0 });
});

test("software D7/D4/D6: one Save writes two records, two safe audit entries, one tag and one dispatch", async (t) => {
  const h = await harness(t);
  assert.equal(await h.actions.publishChanges("events", form([add("new-event"), edit()])), null);
  const data = await h.read();
  assert.equal(data.items.events.find((item) => item.id === event.id).title, "Edited event");
  assert.equal(data.items.events.find((item) => item.id === "new-event").title, "Draft event");
  assert.equal(data.audit.length, 2);
  assert.equal(data.audit[0].summary, "Added event: Draft event");
  assert.equal(data.audit[1].summary, "Changed events: title of Edited event");
  assert.deepEqual(h.counts, { auth: 1, upload: 0, tags: 1, dispatch: 1 });
});

test("software D7: fresh row conflict refuses the whole set and names the stale change", async (t) => {
  const h = await harness(t);
  const current = await h.read();
  current.items.events[0] = { ...event, title: "Another editor", updatedAt: "2026-10-11T13:00:00.000Z" };
  await writeFile(h.file, JSON.stringify(current));
  const result = await h.actions.publishChanges("events", form([add("new-event"), edit()]));
  assert.equal(result.changeId, "saved-event:fields");
  assert.match(result.error, /Reload the page/);
  assert.deepEqual(await h.read(), current);
  assert.equal(h.counts.dispatch, 0);
});

test("software D7: store compares again immediately before writing, including hide and restore stamps", async (t) => {
  const h = await harness(t);
  const result = draft.validateChanges(collectionById("events"), [edit()], [record()]);
  const current = await h.read();
  current.hidden.push({ collection: "events", key: event.id, at: "2026-10-11T13:00:00.000Z" });
  await writeFile(h.file, JSON.stringify(current));
  await assert.rejects(h.store.saveCollectionChanges("events", result.plans, []), /Someone changed this record/);
  assert.deepEqual(await h.read(), current);
});

test("software D7: hide and restore affect public item reads; delete removes the saved record", async (t) => {
  const h = await harness(t);
  const hidden = { id: "hide", recordId: event.id, source: "dashboard", base: record().base, action: "hide" };
  assert.equal(await h.actions.publishChanges("events", form([hidden])), null);
  assert.equal((await h.store.listItems("events")).length, 0);
  const data = await h.read();
  const base = draft.recordStamp(data.items.events[0], true, data.hidden[0].at);
  assert.equal(await h.actions.publishChanges("events", form([{ ...hidden, id: "restore", base, action: "restore" }])), null);
  assert.equal((await h.store.listItems("events")).length, 1);
  assert.equal(await h.actions.publishChanges("events", form([{ ...hidden, id: "delete", action: "delete" }])), null);
  assert.equal((await h.store.listItems("events")).length, 0);
  assert.deepEqual((await h.read()).audit.map((row) => row.action), ["hide", "restore", "delete"]);
});

test("software D3: newest override wins regardless of row order, without mutating the source", () => {
  const people = [{ id: "person", name: "Original", role: "Original role", portrait: { src: "/original.webp", width: 600, height: 720, alt: "Original" } }];
  const rows = [
    { collection: "staff", key: "person", fields: JSON.stringify({ role: "Newest", image: "/new.webp" }), at: "2026-10-11T12:00:00.000Z" },
    { collection: "staff", key: "person", fields: JSON.stringify({ role: "Older" }), at: "2026-10-10T12:00:00.000Z" },
    { collection: "cohorts", key: "person", fields: JSON.stringify({ name: "Another collection" }), at: "2026-10-12T12:00:00.000Z" },
  ];
  const result = overrides.mergeOverrides("staff", people, (person) => person.id, rows);
  assert.equal(result[0].role, "Newest");
  assert.equal(result[0].portrait.src, "/new.webp");
  assert.equal(result[0].name, "Original");
  assert.equal(people[0].role, "Original role");
  assert.equal(people[0].portrait.src, "/original.webp");
});

test("software D3: override field mappings work for every built-in collection", () => {
  assert.equal(overrides.mergeOverride("events", { title: "Old" }, { title: "New" }).title, "New");
  const cohort = overrides.mergeOverride("cohorts", { name: "Person", cohort: "Old", image: "/old.webp" }, { year: "New", summary: "Quote", image: "/new.webp" });
  assert.equal(cohort.cohort, "New"); assert.equal(cohort.quote, "Quote");
  const newsletter = overrides.mergeOverride("newsletters", { title: "Issue", external: "/old.pdf", cover: { src: "/old.webp" } }, { image: "/new.webp", pdf: "/new.pdf" });
  assert.equal(newsletter.cover.src, "/new.webp"); assert.equal(newsletter.external, "/new.pdf");
});

test("software D4: audit never contains a password, hash, confirmation, token, or file field", () => {
  const entry = auditEntry({ who: "editor@example.test", action: "login-failure", summary: "Credentials did not match.", password: "secret-password", hash: "secret-hash", confirm: "secret-password", token: "secret-token", file: new File(["secret bytes"], "secret") });
  assert.deepEqual(Object.keys(entry).sort(), ["action", "at", "collection", "recordId", "recordTitle", "summary", "who"]);
  assert.doesNotMatch(JSON.stringify(entry), /secret-password|secret-hash|secret-token|secret bytes/);
  assert.doesNotMatch(read("scripts/sync-cms.mjs"), /readTabs\(\[[^\]]*"audit"/);
});

test("software D1: event/activity links accept only HTTPS www.linkedin.com or lnkd.in", () => {
  for (const section of ["events", "activities"]) {
    const collection = collectionById(section);
    assert.equal(collection.fields.find((field) => field.name === "link").label, "LinkedIn post link");
    for (const link of ["https://www.linkedin.com/posts/cdie_activity-123-abc", "https://lnkd.in/example"]) assert.ok("fields" in draft.validateFields(collection, { title: "Event", start: "2026-10-11", link }));
    for (const link of ["http://www.linkedin.com/posts/a", "https://linkedin.com/posts/a", "https://evil.test/", "https://www.linkedin.com.evil.test/", "https://www.linkedin.com@evil.test/", "https://lnkd.in:444/a", "javascript:alert(1)"]) assert.match(draft.validateFields(collection, { title: "Event", start: "2026-10-11", link }).error, /LinkedIn post link/);
  }
});

test("software D7: missing draft files and invalid file types save nothing", async (t) => {
  const h = await harness(t);
  for (const withFile of [false, true]) {
    const data = form([add("photo-event", { title: "Event", start: "2026-10-11", image: "new:image" })]);
    if (withFile) data.set("new:image", new File(["not an image"], "not.pdf", { type: "application/pdf" }));
    const error = await h.actions.publishChanges("events", data);
    assert.equal(error.changeId, "photo-event:fields");
    assert.ok(error.error);
  }
  assert.equal(h.counts.upload, 0); assert.equal(h.counts.dispatch, 0);
  assert.equal((await h.read()).audit, undefined);
});
