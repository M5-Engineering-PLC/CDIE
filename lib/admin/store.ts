/*
  The admin store: dashboard content, analytics counters and uploaded files.

  It is a JSON file and a folder of uploads under CMS_DATA_DIR (default .data
  in the project, git-ignored). That suits a single long-running server, which
  is what `next start` on a VM or container gives you. A serverless host such
  as Vercel has no persistent disk, so there this file must be swapped for a
  database or blob store; nothing outside this file knows the difference.
*/

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CollectionId } from "./collections";

export type Item = { id: string; createdAt: string } & Record<string, string>;

export type Subscription = { email: string; at: string };
export type EnquiryRecord = { reason: string; at: string };

type Data = {
  items: Partial<Record<CollectionId, Item[]>>;
  subscriptions: Subscription[];
  enquiries: EnquiryRecord[];
};

const root = () => path.resolve(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".data"));
const file = () => path.join(root(), "cms.json");
export const uploadsDir = () => path.join(root(), "uploads");

const empty = (): Data => ({ items: {}, subscriptions: [], enquiries: [] });

async function load(): Promise<Data> {
  try {
    return { ...empty(), ...JSON.parse(await readFile(file(), "utf8")) };
  } catch {
    return empty();
  }
}

// Writes are serialised so two requests cannot interleave a read and a write.
let queue: Promise<unknown> = Promise.resolve();
function update(change: (data: Data) => void) {
  const run = queue.then(async () => {
    const data = await load();
    change(data);
    await mkdir(root(), { recursive: true });
    const temp = `${file()}.${randomUUID()}.tmp`;
    await writeFile(temp, JSON.stringify(data, null, 2));
    await rename(temp, file());
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function listItems(collection: CollectionId): Promise<Item[]> {
  return (await load()).items[collection] ?? [];
}

export async function addItem(collection: CollectionId, fields: Record<string, string>) {
  const item: Item = { ...fields, id: randomUUID(), createdAt: new Date().toISOString() };
  await update((data) => {
    data.items[collection] = [item, ...(data.items[collection] ?? [])];
  });
  return item;
}

export async function removeItem(collection: CollectionId, id: string) {
  await update((data) => {
    data.items[collection] = (data.items[collection] ?? []).filter((item) => item.id !== id);
  });
}

export async function saveUpload(file: File): Promise<string> {
  const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".bin";
  const name = `${randomUUID()}${ext}`;
  await mkdir(uploadsDir(), { recursive: true });
  await writeFile(path.join(uploadsDir(), name), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${name}`;
}

export async function recordSubscription(email: string) {
  let added = false;
  await update((data) => {
    if (data.subscriptions.some((entry) => entry.email === email)) return;
    data.subscriptions.push({ email, at: new Date().toISOString() });
    added = true;
  });
  return added;
}

export async function recordEnquiry(reason: string) {
  await update((data) => {
    data.enquiries.push({ reason: reason || "general", at: new Date().toISOString() });
  });
}

export async function readAnalytics() {
  const data = await load();
  return { subscriptions: data.subscriptions, enquiries: data.enquiries };
}
