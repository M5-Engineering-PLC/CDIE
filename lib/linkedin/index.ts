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

import { readStoreConfig } from "./config";
import { EMPTY_FEED } from "./client";
import { buildFeed } from "./feed";
import { readStore } from "./store";

export { CACHE_SECONDS, MAX_POSTS, RECENT_POSTS } from "./config";
export { EMPTY_FEED, fetchLinkedInFeed } from "./client";
export { isStale, linkedInCopy, STALE_AFTER_HOURS } from "@/content/linkedin";
export type { LinkedInFeed, LinkedInPost } from "@/content/linkedin";

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
