import assert from "node:assert/strict";
import test from "node:test";

import { deriveSyncedAt } from "../lib/linkedin/sync.ts";

const now = new Date("2026-09-22T10:00:00Z");

test("a Make heartbeat wins, and the newest one is the sync time", () => {
  const rows = [
    { postedAt: "2026-09-01T08:00:00Z", syncedAt: "2026-09-20T06:00:00Z" },
    { postedAt: "2026-09-02T08:00:00Z", syncedAt: "2026-09-20T09:00:00Z" },
  ];
  assert.equal(deriveSyncedAt(rows, now), "2026-09-20T09:00:00.000Z");
});

test("a halted Make scenario is not rescued by the read time", () => {
  // Old heartbeat, recent post: the heartbeat still decides, so the band can go stale.
  const rows = [{ postedAt: "2026-09-21T08:00:00Z", syncedAt: "2026-09-10T06:00:00Z" }];
  assert.equal(deriveSyncedAt(rows, now), "2026-09-10T06:00:00.000Z");
});

test("a hand-kept sheet with no heartbeat is current as of the read", () => {
  const rows = [{ postedAt: "2026-08-01T08:00:00Z", syncedAt: "" }];
  assert.equal(deriveSyncedAt(rows, now), now.toISOString());
});

test("a sheet with no readable rows reports never synced", () => {
  assert.equal(deriveSyncedAt([], now), null);
  assert.equal(deriveSyncedAt([{ postedAt: "not a date" }], now), null);
});
