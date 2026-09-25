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
import { appendRow, deleteRows, readTabs, sheetsConfigured, updateRow, type SheetRow } from "./sheets";

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
export type EnquiryRecord = { reason: string; at: string };

type Data = {
  items: Partial<Record<CollectionId, Item[]>>;
  subscriptions: Subscription[];
  enquiries: EnquiryRecord[];
};

/** Cache tag on every sheet read. Server actions call updateTag(CMS_TAG) after a write. */
export const CMS_TAG = "cms";
const SHEET_CACHE = { revalidate: 300, tags: [CMS_TAG] };
const TABS = [...collections.map((item) => item.id), "subscriptions", "enquiries"];

const root = () => path.resolve(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".data"));
const file = () => path.join(root(), "cms.json");
export const uploadsDir = () => path.join(root(), "uploads");

const empty = (): Data => ({ items: {}, subscriptions: [], enquiries: [] });

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
    enquiries: (rows.enquiries ?? []).map((row) => ({ reason: row.reason, at: row.at })),
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

export async function recordEnquiry(reason: string) {
  const entry = { reason: reason || "general", at: new Date().toISOString() };
  if (sheetsConfigured()) await appendRow("enquiries", entry);
  await updateLocal((data) => {
    data.enquiries.push(entry);
  });
}

export async function readAnalytics() {
  const data = await load();
  return { subscriptions: data.subscriptions, enquiries: data.enquiries };
}
