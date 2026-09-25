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
import { fetchPostImage } from "./image";
import { rowsFromLinks } from "./links";
import { readStore } from "./store";

export { CACHE_SECONDS, MAX_POSTS, RECENT_POSTS } from "./config";
export { EMPTY_FEED, fetchLinkedInFeed } from "./client";
export { linkedInUrn } from "./links";
export { isStale, linkedInCopy, STALE_AFTER_HOURS } from "@/content/linkedin";
export type { LinkedInFeed, LinkedInPost } from "@/content/linkedin";

/** Server-side read. Safe to call from a server component or a route handler.
    `pasted` is the dashboard's posts: any that link to a LinkedIn post join the
    feed, and a pasted post keeps the band current, since a person keeps it. */
export async function getLinkedInFeed(pasted: Parameters<typeof rowsFromLinks>[0] = []): Promise<LinkedInFeed> {
  try {
    const config = readStoreConfig();
    const read = await readStore(config);
    const manual = rowsFromLinks(pasted);
    const feed = buildFeed(
      manual.length ? { rows: [...manual, ...read.rows], syncedAt: new Date().toISOString() } : read,
    );
    /* A post's own picture: the sheet's image column when it has one, else
       the first image on the post itself. */
    const posts = await Promise.all(
      feed.posts.map(async (post) => {
        if (post.image) return post;
        const image = await fetchPostImage(post.permalink);
        return image ? { ...post, image } : post;
      }),
    );
    return { ...feed, posts };
  } catch (error) {
    console.error("[linkedin] feed read failed", error);
    return EMPTY_FEED;
  }
}
