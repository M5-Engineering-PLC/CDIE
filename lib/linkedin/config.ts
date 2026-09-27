/* The browser reads only the committed snapshot. Sync source setup is in
   docs/architecture/linkedin-api.md and scripts/sync-linkedin.mjs. */

/* Next requires a literal in a route segment's `revalidate`, so app/media/page.tsx
   cannot import this. If you change it, change that too. */
export const CACHE_SECONDS = 600;

/** Ceiling on posts kept in the snapshot. */
export const MAX_POSTS = 8;

/*
  Change request 2026-09-21, section 5: "have the 3 recent posts, even reposts,
  on the webpage". The snapshot keeps up to MAX_POSTS so the band has something to
  fall back on when the most recent rows are malformed; the page shows this
  many.
*/
export const RECENT_POSTS = 3;
