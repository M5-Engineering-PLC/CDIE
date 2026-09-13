/*
  Store adapters. Everything above this file works in rows and never knows
  whether they came from a sheet, a CMS or the stub.

  Swapping the store is this file and nothing else, which is the promise the
  integration handoff made when it fixed the data contract.
*/

import { stubFeed } from "@/content/linkedin";

import { CACHE_SECONDS, type StoreConfig } from "./config";
import { parseCsv } from "./csv";

export type StoreRead = {
  /** When the sync mechanism last ran. Null when the store cannot say. */
  syncedAt: string | null;
  rows: unknown[];
};

/*
  lastSyncedAt has to mean "Make ran", not "a post exists", or a genuinely
  quiet fortnight reads as a broken integration and the section hides itself
  while nothing is wrong.

  So a syncedAt column is honoured when the scenario writes one. Without it
  there is no heartbeat and the newest post is the only evidence available;
  docs/architecture/linkedin-api.md sets out the cost of adding the heartbeat.
*/
function deriveSyncedAt(rows: { syncedAt?: string; postedAt?: string }[]): string | null {
  const stamps = rows
    .map((row) => row.syncedAt || row.postedAt || "")
    .map((value) => Date.parse(value))
    .filter((value) => !Number.isNaN(value));

  if (stamps.length === 0) return null;
  return new Date(Math.max(...stamps)).toISOString();
}

async function readSheet(csvUrl: string): Promise<StoreRead> {
  const response = await fetch(csvUrl, {
    next: { revalidate: CACHE_SECONDS },
    headers: { accept: "text/csv" },
  });

  if (!response.ok) {
    throw new Error(`Sheet read failed: ${response.status} ${response.statusText}`);
  }

  const rows = parseCsv(await response.text());
  return { syncedAt: deriveSyncedAt(rows), rows };
}

function readStub(): StoreRead {
  return { syncedAt: stubFeed.lastSyncedAt, rows: stubFeed.posts };
}

export async function readStore(config: StoreConfig): Promise<StoreRead> {
  if (config.kind === "sheet") return readSheet(config.csvUrl);
  return readStub();
}
