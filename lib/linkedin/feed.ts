/*
  Turns store rows into the fixed data contract.

  normalisePost in content/linkedin.ts is the only thing that decides whether a
  row is real; this file orders, deduplicates and caps what survives it. A bad
  row is dropped, never repaired, because a guessed URN would put an arbitrary
  iframe on the page.
*/

import { normalisePost, type LinkedInFeed, type LinkedInPost } from "@/content/linkedin";

import { MAX_POSTS } from "./config";
import type { StoreRead } from "./store";

/** Epoch stands for "never synced". isStale treats it as stale, so a store
    that cannot report a heartbeat degrades to the fallback rather than
    presenting itself as fresh. */
const NEVER = "1970-01-01T00:00:00Z";

export function buildFeed(read: StoreRead, limit: number = MAX_POSTS): LinkedInFeed {
  const seen = new Set<string>();
  const posts: LinkedInPost[] = [];

  for (const row of read.rows) {
    const post = normalisePost(row);
    if (!post || seen.has(post.id)) continue;
    seen.add(post.id);
    posts.push(post);
  }

  posts.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));

  return {
    lastSyncedAt: read.syncedAt ?? NEVER,
    posts: posts.slice(0, limit),
  };
}
