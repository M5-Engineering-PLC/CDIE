/*
  Environment for the LinkedIn read layer.

  One rule selects the store: if LINKEDIN_SHEET_CSV_URL is set the sheet is
  read, otherwise the stub is served. There is no second toggle to disagree
  with, so a half-configured deployment cannot serve an empty feed while
  claiming to be live.

  Setup steps are in docs/architecture/linkedin-api.md.
*/

export type StoreConfig =
  | { kind: "stub" }
  | { kind: "sheet"; csvUrl: string };

/* Next requires a literal in a route segment's `revalidate`, so app/media/page.tsx
   cannot import this. If you change it, change that too. */
export const CACHE_SECONDS = 600;

/** Ceiling on rendered posts. Each one becomes an iframe once it scrolls in. */
export const MAX_POSTS = 8;

/*
  Change request 2026-09-21, section 5: "have the 3 recent posts, even reposts,
  on the webpage". The store keeps up to MAX_POSTS so the band has something to
  fall back on when the most recent rows are malformed; the page shows this
  many.
*/
export const RECENT_POSTS = 3;

/** Refuses a store that is not a published Google Sheet, so a mistyped or
    injected env var cannot turn the read layer into a general fetcher. */
function isPublishedSheetUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "https:" && url.hostname === "docs.google.com";
}

export function readStoreConfig(env: NodeJS.ProcessEnv = process.env): StoreConfig {
  const csvUrl = env.LINKEDIN_SHEET_CSV_URL?.trim();
  if (!csvUrl) return { kind: "stub" };

  if (!isPublishedSheetUrl(csvUrl)) {
    throw new Error(
      "LINKEDIN_SHEET_CSV_URL must be an https docs.google.com published-CSV link",
    );
  }

  return { kind: "sheet", csvUrl };
}
