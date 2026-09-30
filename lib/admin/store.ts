/*
  The admin store: dashboard content, analytics counters and uploaded files.

  Final pass 2026-09-23: the Google Sheet is the database. Where it is
  configured (lib/admin/sheets.ts) every write goes to it and every read comes
  from it, one tab per collection plus "subscriptions" and "enquiries".

  Two copies sit behind it:
  - content/cms-snapshot.json, which the GitHub Action (.github/workflows/sync-cms.yml)
    refreshes from the sheet and commits. It is what the site reads when the
    sheet is unreachable, or when a deployment carries no Google credentials.
  - a JSON file under CMS_DATA_DIR (default .data, git-ignored), which every
    write also updates. It keeps a local dev server working with no sheet at all.

  Nothing outside this file knows which one answered.
*/

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import snapshot from "@/content/cms-snapshot.json";

import { collections, type CollectionId } from "./collections";
import { commitUpload, notifyContentChanged } from "./github";
import { appendRow, deleteRows, readTab, readTabs, sheetsConfigured, updateRow, type SheetRow } from "./sheets";

export type Item = { id: string; createdAt: string } & Record<string, string>;

/*
  2026-09-25: the newsletter list. A sign-up from the website starts "pending"
  and becomes "confirmed" only when the reader opens the link we email them
  (double opt-in), which keeps typos and other people's addresses off the list.
  Rows written before this change carry no status; they count as confirmed,
  the decision taken with the team on 25 September.

  `token` is the secret in the confirm and unsubscribe links. It is per
  subscriber and never shown on a page.
*/
export type SubscriptionStatus = "pending" | "confirmed" | "unsubscribed";

export type Subscription = {
  email: string;
  at: string;
  status?: SubscriptionStatus;
  token?: string;
  confirmedAt?: string;
};

/** A row with no status predates double opt-in and counts as confirmed. */
export const subscriptionStatus = (entry: Subscription): SubscriptionStatus => entry.status ?? "confirmed";
/*
  Review 2026-09-30: "contact forms ... show actual email and message". Rows
  from before then carry only the reason and time. These fields are personal
  data: they stay in the sheet and the git-ignored local file, never in the
  committed snapshot (scripts/sync-cms.mjs leaves enquiries out).
*/
export type EnquiryRecord = { reason: string; at: string; name?: string; email?: string; message?: string };

/*
  Review 2026-09-30, dashboard: the site's own records (the ones in content/)
  can be taken off the website. They are not deleted from the code; a row here
  hides one, keyed by collection and the record's id, and deleting the row
  brings it back. Studio photograph lists replace a capability's photographs
  once an editor has changed them. Both are public configuration, so both are
  carried in the committed snapshot.
*/
export type HiddenRecord = { collection: string; key: string; at: string };
export type StudioPhoto = { src: string; alt: string; width: number; height: number };
export type StudioPhotoRecord = { capability: string; photos: string; at: string };

/** A dashboard account. `hash` is a salted scrypt hash (lib/admin/auth.ts). */
export type Account = { email: string; hash: string; createdAt: string };

type Data = {
  /** Only ever in the local file and the sheet's "accounts" tab; never read with the site's content. */
  accounts?: Account[];
  items: Partial<Record<CollectionId, Item[]>>;
  subscriptions: Subscription[];
  enquiries: EnquiryRecord[];
  hidden: HiddenRecord[];
  studio: StudioPhotoRecord[];
};

/** Cache tag on every sheet read. Server actions call updateTag(CMS_TAG) after a write. */
export const CMS_TAG = "cms";
const SHEET_CACHE = { revalidate: 300, tags: [CMS_TAG] };
const TABS = [...collections.map((item) => item.id), "subscriptions", "enquiries", "hidden", "studio"];

const root = () => path.resolve(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".data"));
const file = () => path.join(root(), "cms.json");
export const uploadsDir = () => path.join(root(), "uploads");

const empty = (): Data => ({ items: {}, subscriptions: [], enquiries: [], hidden: [], studio: [] });

/* Records saved before the rename live under "media"; they are posts now. */
function normalise(data: Partial<Data> & { items?: Record<string, Item[]> }): Data {
  const items = { ...(data.items ?? {}) } as Record<string, Item[]>;
  if (items.media) {
    items.posts = [...(items.posts ?? []), ...items.media];
    delete items.media;
  }
  return { ...empty(), ...data, items: items as Data["items"] };
}

async function loadLocal(): Promise<Data | null> {
  try {
    return normalise(JSON.parse(await readFile(file(), "utf8")));
  } catch {
    return null;
  }
}

const fromSnapshot = (): Data => normalise(snapshot as Partial<Data>);

function fromRows(rows: Record<string, SheetRow[]>): Data {
  const items: Data["items"] = {};
  for (const collection of collections) {
    items[collection.id] = (rows[collection.id] ?? [])
      .filter((row) => row.id)
      .map((row) => Object.fromEntries(Object.entries(row).filter(([, value]) => value !== "")) as Item)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return {
    items,
    subscriptions: (rows.subscriptions ?? []).map((row) => ({
      email: row.email,
      at: row.at,
      status: (row.status || undefined) as SubscriptionStatus | undefined,
      token: row.token || undefined,
      confirmedAt: row.confirmedAt || undefined,
    })),
    enquiries: (rows.enquiries ?? []).map((row) => ({
      reason: row.reason,
      at: row.at,
      name: row.name || undefined,
      email: row.email || undefined,
      message: row.message || undefined,
    })),
    hidden: (rows.hidden ?? []).filter((row) => row.collection && row.key).map((row) => ({ collection: row.collection, key: row.key, at: row.at })),
    studio: (rows.studio ?? []).filter((row) => row.capability).map((row) => ({ capability: row.capability, photos: row.photos, at: row.at })),
  };
}

async function load(): Promise<Data> {
  if (sheetsConfigured()) {
    try {
      return fromRows(await readTabs(TABS, SHEET_CACHE));
    } catch (error) {
      console.error("[admin] sheet read failed, serving the snapshot", error);
      return fromSnapshot();
    }
  }
  return (await loadLocal()) ?? fromSnapshot();
}

// Local writes are serialised so two requests cannot interleave a read and a write.
let queue: Promise<unknown> = Promise.resolve();
function updateLocal(change: (data: Data) => void) {
  const run = queue.then(async () => {
    const data = (await loadLocal()) ?? fromSnapshot();
    change(data);
    await mkdir(root(), { recursive: true });
    const temp = `${file()}.${randomUUID()}.tmp`;
    await writeFile(temp, JSON.stringify(data, null, 2));
    await rename(temp, file());
  });
  queue = run.catch(() => undefined);
  // A read-only filesystem (a serverless host) must not fail a write the sheet accepted.
  return sheetsConfigured() ? run.catch((error) => console.error("[admin] local mirror write failed", error)) : run;
}

export async function listItems(collection: CollectionId): Promise<Item[]> {
  return (await load()).items[collection] ?? [];
}

export async function addItem(collection: CollectionId, fields: Record<string, string>) {
  const item: Item = { ...fields, id: randomUUID(), createdAt: new Date().toISOString() };
  if (sheetsConfigured()) await appendRow(collection, { id: item.id, createdAt: item.createdAt, ...fields });
  await updateLocal((data) => {
    data.items[collection] = [item, ...(data.items[collection] ?? [])];
  });
  await notifyContentChanged(`added ${collection}`);
  return item;
}

export async function removeItem(collection: CollectionId, id: string) {
  if (sheetsConfigured()) await deleteRows(collection, "id", id);
  await updateLocal((data) => {
    data.items[collection] = (data.items[collection] ?? []).filter((item) => item.id !== id);
  });
  await notifyContentChanged(`removed ${collection}`);
}

export async function saveUpload(file: File): Promise<string> {
  const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".bin";
  const name = `${randomUUID()}${ext}`;
  const body = Buffer.from(await file.arrayBuffer());
  const committed = await commitUpload(name, body);
  try {
    await mkdir(uploadsDir(), { recursive: true });
    await writeFile(path.join(uploadsDir(), name), body);
  } catch (error) {
    if (!committed) throw error;
  }
  return `/api/uploads/${name}`;
}

/*
  Records a sign-up and hands back what the page should say. An address already
  on the list is never duplicated: a confirmed one is told so, and a pending one
  gets its confirmation link sent again rather than a second row.
*/
export async function recordSubscription(email: string): Promise<{
  outcome: "created" | "pending" | "confirmed";
  token: string;
}> {
  const data = await load();
  const existing = data.subscriptions.find((entry) => entry.email === email);
  if (existing && subscriptionStatus(existing) === "confirmed") {
    return { outcome: "confirmed", token: existing.token ?? "" };
  }
  if (existing) return { outcome: "pending", token: existing.token ?? "" };

  const entry: Subscription = {
    email,
    at: new Date().toISOString(),
    status: "pending",
    token: randomUUID(),
  };
  if (sheetsConfigured()) await appendRow("subscriptions", entry as unknown as SheetRow);
  await updateLocal((local) => {
    if (!local.subscriptions.some((item) => item.email === email)) local.subscriptions.push(entry);
  });
  return { outcome: "created", token: entry.token as string };
}

async function setSubscription(token: string, patch: Partial<Subscription>): Promise<Subscription | null> {
  const data = await load();
  const entry = data.subscriptions.find((item) => item.token === token);
  if (!entry) return null;
  if (sheetsConfigured()) await updateRow("subscriptions", "token", token, patch as SheetRow);
  await updateLocal((local) => {
    const row = local.subscriptions.find((item) => item.token === token);
    if (row) Object.assign(row, patch);
  });
  return { ...entry, ...patch };
}

/** Turns a pending sign-up into a subscriber. Returns null for an unknown token. */
export async function confirmSubscription(token: string) {
  return setSubscription(token, { status: "confirmed", confirmedAt: new Date().toISOString() });
}

/** Takes an address off the list without deleting the record. */
export async function unsubscribe(token: string) {
  return setSubscription(token, { status: "unsubscribed" });
}

/** Everyone the newsletter goes to, in the order they joined. */
export async function listSubscribers(status: SubscriptionStatus = "confirmed") {
  const data = await load();
  return data.subscriptions.filter((entry) => subscriptionStatus(entry) === status);
}

/** Merges fields into one saved record, for example a newsletter's send record. */
export async function updateItem(collection: CollectionId, id: string, patch: Record<string, string>) {
  if (sheetsConfigured()) await updateRow(collection, "id", id, patch);
  await updateLocal((data) => {
    const item = (data.items[collection] ?? []).find((entry) => entry.id === id);
    if (item) Object.assign(item, patch);
  });
}

export async function recordEnquiry(fields: { reason: string; name?: string; email?: string; message?: string }) {
  const entry: EnquiryRecord & SheetRow = {
    reason: fields.reason || "general",
    at: new Date().toISOString(),
    name: fields.name ?? "",
    email: fields.email ?? "",
    message: fields.message ?? "",
  };
  if (sheetsConfigured()) await appendRow("enquiries", entry);
  await updateLocal((data) => {
    data.enquiries.push(entry);
  });
}

export async function readAnalytics() {
  const data = await load();
  return { subscriptions: data.subscriptions, enquiries: data.enquiries };
}

/** Every hidden site record, as "collection:key". */
export async function hiddenKeys(): Promise<Set<string>> {
  return new Set((await load()).hidden.map((row) => `${row.collection}:${row.key}`));
}

/** Takes one of the site's own records off the website. */
export async function hideBuiltIn(collection: string, key: string) {
  if ((await hiddenKeys()).has(`${collection}:${key}`)) return;
  const row = { collection, key, at: new Date().toISOString() };
  // `ref` is the one column a restore can match on without touching another collection's rows.
  if (sheetsConfigured()) await appendRow("hidden", { ref: `${collection}:${key}`, ...row });
  await updateLocal((data) => { data.hidden.push(row); });
  await notifyContentChanged(`hid ${collection}`);
}

/** Puts a hidden site record back on the website. */
export async function unhideBuiltIn(collection: string, key: string) {
  if (sheetsConfigured()) await deleteRows("hidden", "ref", `${collection}:${key}`);
  await updateLocal((data) => { data.hidden = data.hidden.filter((row) => !(row.collection === collection && row.key === key)); });
  await notifyContentChanged(`restored ${collection}`);
}

/** The photograph lists an editor has set, by capability id. */
export async function studioPhotoOverrides(): Promise<Record<string, StudioPhoto[]>> {
  const result: Record<string, StudioPhoto[]> = {};
  for (const row of (await load()).studio) {
    try {
      const photos = JSON.parse(row.photos) as StudioPhoto[];
      if (Array.isArray(photos)) result[row.capability] = photos.filter((photo) => photo?.src && photo.width > 0 && photo.height > 0);
    } catch {
      console.error("[admin] unreadable studio photo list for", row.capability);
    }
  }
  return result;
}

/** Replaces one capability's photographs, in order. */
export async function saveStudioPhotos(capability: string, photos: StudioPhoto[]) {
  const row = { capability, photos: JSON.stringify(photos), at: new Date().toISOString() };
  const present = (await load()).studio.some((entry) => entry.capability === capability);
  if (sheetsConfigured()) {
    if (present) await updateRow("studio", "capability", capability, row);
    else await appendRow("studio", row);
  }
  await updateLocal((data) => {
    data.studio = [...data.studio.filter((entry) => entry.capability !== capability), row];
  });
  await notifyContentChanged("studio photographs");
}

/*
  Dashboard accounts. Read on every sign-in straight from the sheet, uncached,
  so a new account can sign in at once; never part of load(), so the site's
  content reads never carry a password hash.
*/
export async function findAccount(email: string): Promise<Account | null> {
  if (sheetsConfigured()) {
    const row = (await readTab("accounts", { revalidate: 0 })).find((entry) => entry.email === email);
    return row?.hash ? { email: row.email, hash: row.hash, createdAt: row.createdAt } : null;
  }
  return ((await loadLocal())?.accounts ?? []).find((entry) => entry.email === email) ?? null;
}

export async function addAccount(account: Account) {
  if (sheetsConfigured()) await appendRow("accounts", account);
  await updateLocal((data) => {
    data.accounts = [...(data.accounts ?? []).filter((entry) => entry.email !== account.email), account];
  });
}
