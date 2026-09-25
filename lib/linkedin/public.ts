/*
  The page's own public posts, read with no LinkedIn account and no admin role.

  2026-09-25: replaces the Make scenario as the way new posts reach the site.
  LinkedIn's public company page carries a JSON-LD block for search engines
  listing the page's latest posts (about seven) as SocialMediaPosting entries,
  each with its URL, datePublished and text. The server reads that block once
  an hour and the posts join the feed; the embeds themselves come from
  LinkedIn as before.

  It is best-effort by design. If LinkedIn changes the page or turns the
  request away, this returns no rows and the feed falls back to the sheet and
  the dashboard, which keep working on their own.

  Node built-ins only, so the tests can import it with type stripping.
*/

import { linkedInUrn } from "./links.ts";

/** Invention Education - Kenyatta University, the page every CDIE post comes from. */
export const LINKEDIN_PAGE = "https://www.linkedin.com/company/invention-education-kenyatta-university/";
const HOUR_SECONDS = 3_600;

type Posting = { "@type"?: string; url?: string; datePublished?: string; text?: string };

/** Feed rows from the page's JSON-LD. Anything that is not a dated post with a post URL is skipped. */
export function parsePublicPage(html: string) {
  const rows: { id: string; postedAt: string; text: string; repost: string }[] = [];
  const blocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const [, body] of blocks) {
    let data: { "@graph"?: Posting[] } & Posting;
    try {
      data = JSON.parse(body);
    } catch {
      continue;
    }
    for (const entry of data["@graph"] ?? [data]) {
      if (entry["@type"] !== "SocialMediaPosting") continue;
      const id = linkedInUrn(entry.url);
      if (!id || Number.isNaN(Date.parse(entry.datePublished ?? ""))) continue;
      rows.push({ id, postedAt: entry.datePublished as string, text: (entry.text ?? "").trim(), repost: "" });
    }
  }
  return rows;
}

/** The page's latest posts, or none. Never throws. */
export async function fetchPublicPosts(page: string = LINKEDIN_PAGE) {
  try {
    const response = await fetch(page, {
      headers: {
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
        accept: "text/html",
        "accept-language": "en",
      },
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: HOUR_SECONDS },
    } as RequestInit);
    if (!response.ok) return [];
    return parsePublicPage(await response.text());
  } catch {
    return [];
  }
}
