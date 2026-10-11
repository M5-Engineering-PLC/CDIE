/*
  The public surface of the LinkedIn read layer. Import from "@/lib/linkedin"
  and nothing deeper; the files behind this one are free to change.

  Two entry points, because the app has two kinds of caller:

  - getLinkedInFeed() for server components. Reads the committed snapshot, with
    no HTTP hop or LinkedIn request during page rendering.
  - fetchLinkedInFeed() for a client component that needs to refresh without a
    navigation. Goes through /api/linkedin-posts.

  Both return the same contract, and both degrade to an empty, stale feed
  rather than throwing. A media section that quietly falls back is correct; one
  that takes the page down with it is not.
*/

import type { LinkedInFeed } from "@/content/linkedin";
import snapshot from "@/content/linkedin-snapshot.json";
import { linkedinOverrides } from "@/lib/admin/linkedinOverrides";

import { EMPTY_FEED } from "./client";
import { buildFeed } from "./feed";
import { placePosts, postKey } from "./placement.mjs";

export { CACHE_SECONDS, MAX_POSTS, RECENT_POSTS } from "./config";
export { EMPTY_FEED, fetchLinkedInFeed } from "./client";
export { linkedInUrn } from "./links";
export { isStale, linkedInCopy, STALE_AFTER_HOURS } from "@/content/linkedin";
export type { LinkedInFeed, LinkedInPost } from "@/content/linkedin";

/* Fix plan 2026-10-11, W3: calendar and community share the saved placement. */
export async function getLinkedInPlacements() {
  return placePosts(snapshot.posts, snapshot.calendar, await linkedinOverrides());
}

export async function getLinkedInCommunityFeed(calendarLinks: string[]): Promise<LinkedInFeed> {
  const [feed, placement] = await Promise.all([getLinkedInPosts(), getLinkedInPlacements()]);
  const allowed = new Set(placement.community.map((post) => postKey(post.permalink)));
  const calendar = new Set(calendarLinks.map(postKey));
  return { ...feed, posts: feed.posts.filter((post) => allowed.has(postKey(post.permalink)) && !calendar.has(postKey(post.permalink))) };
}

/* Fix plan 2026-10-11, W3: the existing refresh API also respects placement. */
export async function getLinkedInFeed(): Promise<LinkedInFeed> {
  return getLinkedInCommunityFeed([]);
}

/** Server-side read. All image paths in the browser resolve on this site. */
export async function getLinkedInPosts(): Promise<LinkedInFeed> {
  const feed = buildFeed({
    // A hand-kept sheet has no heartbeat. Its post dates remain visible; the
    // scheduled sync only writes a timestamp when the upstream supplies one.
    syncedAt: snapshot.lastSyncedAt ?? (snapshot.posts.length ? new Date().toISOString() : null),
    rows: snapshot.posts,
  });
  return feed.posts.length
    ? { ...feed, posts: feed.posts.map((post) => ({
        ...post,
        image: post.image?.startsWith("/linkedin/") ? post.image : undefined,
      })) }
    : EMPTY_FEED;
}
