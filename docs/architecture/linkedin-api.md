# LinkedIn read layer

Date: 2026-09-11
Governing decision record: CDIE_Website_LinkedIn_Integration_Handoff_2026-09-11.md
Status: Read layer built and serving the stub. The Make scenario and the sheet
do not exist yet. Nothing in this document reports a working integration.

## What this is

The site shows CDIE's LinkedIn posts as LinkedIn's own embeds. Nothing is
scraped. Make polls the page through LinkedIn's official API, writes a row per
post into a Google Sheet, and this read layer serves that sheet to the site.

```text
LinkedIn page
     |  Make, "Watch company posts"
     v
Google Sheet  -->  lib/linkedin  -->  getLinkedInFeed()      server components
                                 -->  /api/linkedin-posts -> fetchLinkedInFeed()
```

## Using it from the app

A server component reads the store directly. No HTTP hop:

```ts
import { getLinkedInFeed, isStale, linkedInCopy } from "@/lib/linkedin";

const feed = await getLinkedInFeed();
<LinkedInCarousel posts={feed.posts} stale={isStale(feed.lastSyncedAt)} />
```

A client component that needs to refresh without a navigation calls
`fetchLinkedInFeed()` instead. Both return the same contract and both return an
empty, stale feed on failure rather than throwing, so a store outage degrades
the Media section and never takes the page down.

Import from `@/lib/linkedin` only. The files behind it are free to change.

### The Media page is static, and that will freeze the feed

`npm run build` currently prerenders `/media` as static. A static page that
calls `getLinkedInFeed()` reads the store once at build time and then serves
that snapshot until the next deploy, so new posts would never appear.

Whoever wires the page must opt it into revalidation in the same change:

```ts
export const revalidate = 600;
```

That matches CACHE_SECONDS and keeps the page static between refreshes. Without
that line the integration looks wired and silently never updates, which is the
same class of failure as the staleness problem below.

## Files

| Path | Holds |
|---|---|
| `content/linkedin.ts` | The data contract, URN validation, staleness rule, copy |
| `lib/linkedin/config.ts` | Environment, cache window, post cap, store selection |
| `lib/linkedin/csv.ts` | RFC 4180 reader for the published sheet |
| `lib/linkedin/store.ts` | Store adapters. Swapping store is this file alone |
| `lib/linkedin/feed.ts` | Ordering, deduplication, cap |
| `lib/linkedin/index.ts` | The public surface |
| `app/api/linkedin-posts/route.ts` | The HTTP edge, nothing more |

## The sheet

One tab, one row per post, first row a header. Column names must match:

| Column | Required | Notes |
|---|---|---|
| `id` | yes | The URN, for example `urn:li:share:7123456789` |
| `postedAt` | yes | ISO 8601 |
| `text` | no | The post commentary |
| `syncedAt` | no | ISO 8601, written every run. See staleness below |

`embedUrl` and `permalink` are not columns. They are rebuilt from the validated
URN, so a malformed or hostile row cannot put an arbitrary iframe on the page.

Publish the tab with File > Share > Publish to web, choose comma-separated
values, and put that URL in `LINKEDIN_SHEET_CSV_URL`. Publishing to web makes
the tab readable by anyone with the link, so the sheet must hold nothing but
these columns.

## Staleness, and a correction to the handoff

The handoff said the section hides itself when `lastSyncedAt` is over 48 hours
old, so a halted Make scenario cannot leave old posts on the page pretending to
be current. That still holds, but the handoff missed a case.

If Make only writes a row when a post exists, then a fortnight with no posts is
indistinguishable from a broken integration. The section would hide itself while
everything was working.

The fix is a heartbeat: the scenario writes `syncedAt` on every run whether or
not there was a new post. The read layer prefers `syncedAt` and falls back to
the newest `postedAt` when the column is absent.

That costs an operation per run, which changes the budget:

| Polling | Operations per month | Inside the 1,000 free tier |
|---|---|---|
| Hourly, no heartbeat | about 745 | yes, thin headroom, staleness unreliable |
| Hourly, with heartbeat | about 1,475 | no |
| Two-hourly, with heartbeat | about 745 | yes, staleness correct |

Recommendation: poll two-hourly and write the heartbeat. A two-hour delay on a
LinkedIn post reaching the website is not a cost anyone will notice, and it buys
a staleness signal that actually means something.

## Unverified

Carried from the handoff, still not checked. None of them change this layer.

- Whether the Make free plan caps the minimum polling interval.
- Whether the trigger emits `ugcPost` URNs, and whether those work in the embed
  path. The validator accepts all three URN types; only the embed behaviour is
  unconfirmed.
- Whether the trigger returns post text or only IDs. If only IDs, the scenario
  needs a second module and the budget above doubles again.

## Not built

- No tests. The repository has no test runner, and adding one is a decision for
  the review session, not this lane.
- The Media page still imports `stubFeed`. Swapping it for `getLinkedInFeed()`
  is one line, left to whoever owns that file.
- No ingest endpoint. Make writes to the sheet, not to this app. If that ever
  changes, a push route needs somewhere to persist and that is a new dependency.
