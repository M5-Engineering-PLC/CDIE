/*
  Pasted LinkedIn links, the hand-kept path into the feed.

  2026-09-25: until a CDIE page admin connects the Make scenario, a post
  reaches the Media band when someone adds it in the dashboard (Posts, Link).
  This file turns the link into a store row; normalisePost still decides
  whether the row is real, so a link with no post id is dropped, never guessed.

  Node built-ins only, so the tests can import it with type stripping.
*/

/** The forms LinkedIn hands out when you copy a post's link. */
const URN_IN_URL = /urn(?::|%3A)li(?::|%3A)(share|activity|ugcPost)(?::|%3A)(\d+)/i;
const SLUG_IN_URL = /-(share|activity|ugcPost)-(\d+)-/i;

const KINDS: Record<string, string> = { share: "share", activity: "activity", ugcpost: "ugcPost" };

/** The post's URN, or null when the address is not a LinkedIn post. */
export function linkedInUrn(link: string | undefined): string | null {
  if (!link) return null;
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !/(^|\.)linkedin\.com$/.test(url.hostname)) return null;
  const match = url.pathname.match(URN_IN_URL) ?? url.pathname.match(SLUG_IN_URL);
  return match ? `urn:li:${KINDS[match[1].toLowerCase()]}:${match[2]}` : null;
}

type DashboardPost = { link?: string; date?: string; createdAt?: string; title?: string };

/** Store rows for the dashboard posts that link to a LinkedIn post. */
export function rowsFromLinks(posts: DashboardPost[]) {
  return posts.flatMap((post) => {
    const id = linkedInUrn(post.link);
    if (!id) return [];
    const postedAt = post.date ? `${post.date}T00:00:00Z` : post.createdAt ?? "";
    return [{ id, postedAt, text: post.title ?? "", title: post.title ?? "", repost: "" }];
  });
}
