/*
  Store adapters. Everything above this file works in rows and never knows
  whether they came from a sheet, a CMS or the stub.

  Swapping the store is this file and nothing else, which is the promise the
  integration handoff made when it fixed the data contract.
*/

import { stubFeed } from "@/content/linkedin";

import { CACHE_SECONDS, type StoreConfig } from "./config";
import { parseCsv } from "./csv";
import { deriveSyncedAt } from "./sync";

export type StoreRead = {
  /** When the sync mechanism last ran. Null when the store cannot say. */
  syncedAt: string | null;
  rows: unknown[];
};

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
