/*
  The browser half of the read layer, kept apart from index.ts on purpose.

  index.ts reaches the store, so importing it from a client component would
  pull the store adapter and the CSV reader into the browser bundle to call one
  fetch. Nothing in this file touches the store: it asks our own route and
  trusts the contract.
*/

import type { LinkedInFeed } from "@/content/linkedin";

import { CACHE_SECONDS } from "./config";

export const EMPTY_FEED: LinkedInFeed = {
  lastSyncedAt: "1970-01-01T00:00:00Z",
  posts: [],
};

/** Client-side read through the API route. `base` is only needed when calling
    from somewhere without a relative-URL context. */
export async function fetchLinkedInFeed(base = ""): Promise<LinkedInFeed> {
  try {
    const response = await fetch(`${base}/api/linkedin-posts`, {
      next: { revalidate: CACHE_SECONDS },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as LinkedInFeed;
  } catch (error) {
    console.error("[linkedin] feed fetch failed", error);
    return EMPTY_FEED;
  }
}
