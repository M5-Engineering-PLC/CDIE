/*
  The public surface of the LinkedIn read layer. Import from "@/lib/linkedin"
  and nothing deeper; the files behind this one are free to change.

  Two entry points, because the app has two kinds of caller:

  - getLinkedInFeed() for server components. Reads the store directly, with no
    HTTP hop back into our own API.
  - fetchLinkedInFeed() for a client component that needs to refresh without a
    navigation. Goes through /api/linkedin-posts.

  Both return the same contract, and both degrade to an empty, stale feed
  rather than throwing. A media section that quietly falls back is correct; one
  that takes the page down with it is not.
*/

import type { LinkedInFeed } from "@/content/linkedin";

import { CACHE_SECONDS } from "./config";
import { readStoreConfig } from "./config";
import { buildFeed } from "./feed";
import { readStore } from "./store";

export { CACHE_SECONDS, MAX_POSTS } from "./config";
export { isStale, linkedInCopy, STALE_AFTER_HOURS } from "@/content/linkedin";
export type { LinkedInFeed, LinkedInPost } from "@/content/linkedin";

export const EMPTY_FEED: LinkedInFeed = {
  lastSyncedAt: "1970-01-01T00:00:00Z",
  posts: [],
};

/** Server-side read. Safe to call from a server component or a route handler. */
export async function getLinkedInFeed(): Promise<LinkedInFeed> {
  try {
    const config = readStoreConfig();
    return buildFeed(await readStore(config));
  } catch (error) {
    console.error("[linkedin] feed read failed", error);
    return EMPTY_FEED;
  }
}

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
