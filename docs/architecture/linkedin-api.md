# LinkedIn read layer

Date: 2026-09-11, revised 2026-09-22
Governing decision record: CDIE_Website_LinkedIn_Integration_Handoff_2026-09-11.md
Status: Read layer built and wired into the Media page. The sheet exists and is
kept by hand; it is not yet published to the web, so the site still serves the
empty stub. The Make scenario does not exist yet.

## What this is

The site shows IvE's LinkedIn posts as LinkedIn's own embeds. Nothing is
scraped. The posts reach the site through a Google Sheet, and the sheet is
filled in one of two ways:

- By hand, now. Someone copies a post's link from the page and pastes it into
  the sheet. No admin rights, no API and no Make are needed, because LinkedIn's
  embed works for any public post.
- By Make, after handover. On a schedule, Make lists the page's recent posts
  through LinkedIn's official API and overwrites a fixed block of rows. This
  needs a page admin to authorise it once.

The read layer does not know or care which of the two filled the sheet.

```text
LinkedIn page
     |  by hand now; Make "List company posts" every 3 hours after handover
     v
Google Sheet "CDIE LinkedIn feed"
     |
     v
lib/linkedin  -->  getLinkedInFeed()                    server components
              -->  /api/linkedin-posts -> fetchLinkedInFeed()   client components
```

### Which LinkedIn page

Found 2026-09-22. IvE has two LinkedIn presences:

- A company page, `linkedin.com/company/invention-education-kenyatta-university/`,
  514 followers. It posts IvE's own announcements. This is the feed source, and
  it is the only one Make can read, because Make's post modules work on
  organisation pages alone.
- A personal profile, `linkedin.com/in/invention-education-kenyatta-university-a574b9336/`.
  Its recent activity is almost entirely reposts of students' personal posts.
  The site footer in `content/site.ts` links here, labelled "CDIE on LinkedIn".
  Whether the footer should point at the company page instead is an open
  question for the Actual Copy owner, not a change to make quietly.

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

`app/media/page.tsx` already calls `getLinkedInFeed()` and declares
`export const revalidate = 600`. Keep that line. Without it the page is
prerendered once at build time and new posts never appear. The value must match
`CACHE_SECONDS`; Next requires a literal there, so it cannot be imported.

## Files

| Path | Holds |
|---|---|
| `content/linkedin.ts` | The data contract, URN validation, staleness rule, copy |
| `lib/linkedin/config.ts` | Environment, cache window, post caps, store selection |
| `lib/linkedin/csv.ts` | RFC 4180 reader for the published sheet |
| `lib/linkedin/store.ts` | Store adapters. Swapping store is this file alone |
| `lib/linkedin/sync.ts` | What `lastSyncedAt` means for a hand-kept or Make-kept sheet |
| `lib/linkedin/feed.ts` | Ordering, deduplication, cap |
| `lib/linkedin/client.ts` | Browser-side read through the API route |
| `lib/linkedin/index.ts` | The public surface |
| `app/api/linkedin-posts/route.ts` | The HTTP edge, nothing more |

## The sheet

The sheet is "CDIE LinkedIn feed" in the CDIE website Drive folder, file ID
`1YwW7t2l1w1Jp6_y7ENvOpf21XvEB6xH2eVvxEAX7Wg4`, created 2026-09-22 and owned by
a personal account until handover.

One tab, first row a header, one row per post. Column names are case-sensitive
and must match:

| Column | Required | Notes |
|---|---|---|
| A `id` | yes | The URN: `urn:li:share:…`, `urn:li:activity:…` or `urn:li:ugcPost:…` |
| B `postedAt` | yes | ISO 8601 in UTC, for example `2026-09-22T08:00:00Z` |
| C `text` | no | The post commentary |
| D `syncedAt` | no | Empty when kept by hand. Make writes its run time. See staleness below |
| E `repost` | no | `TRUE` where the post is a repost. Anything else reads as false |
| F `url` | no | The post link. The read layer ignores it; column A reads it |

### Adding a post by hand

1. On the company page, open the post's menu (the three dots) and choose Copy
   link to post.
2. Paste the link into column F of the next empty row.
3. Copy the formula in column A down from the row above. It turns the link into
   the post URN:
   ```
   =IF(F2="","",IFERROR(REGEXEXTRACT(F2,"urn:li:(?:share|activity|ugcPost):\d+"),"urn:li:activity:"&REGEXEXTRACT(F2,"activity-(\d+)")))
   ```
4. Fill in `postedAt`, the first line of the post as `text`, and `repost`.

The post's date can be read from its ID. A LinkedIn post ID carries its
creation time in milliseconds in its upper bits, so
`new Date(Number(BigInt(id) >> 22n))` gives it. This is how the first three
rows were dated. It is an observed property of LinkedIn IDs, not a documented
one; check it against the date shown on the post.

Format columns A to D as plain text before the first run (Format > Number >
Plain text). Otherwise Sheets converts the ISO strings into its own date
format, the CSV exports them without a timezone, and they parse as local time.

A row whose `id` fails validation or whose `postedAt` does not parse is dropped
silently. `embedUrl` and `permalink` are not columns. They are rebuilt from the
validated URN, so a malformed or hostile row cannot put an arbitrary iframe on
the page.

`repost` was added on 2026-09-21. A repost arrives with a URN of its own and
needs no new path through the read layer, but the card has to say so: the words
in a repost are not CDIE's, and a card that does not label them misattributes
them. The scenario sets the column; nothing in the read layer infers it.

The page shows the three most recent rows. `RECENT_POSTS` in
`lib/linkedin/config.ts` is that number; the store keeps up to `MAX_POSTS`
(eight), so the band has something to fall back on when the newest rows are
malformed and get dropped.

Publishing the tab makes it readable by anyone with the link, so the sheet must
hold nothing but these columns.

## Staleness, and two corrections to the handoff

The handoff said the section hides itself when `lastSyncedAt` is over 48 hours
old, so a halted Make scenario cannot leave old posts on the page pretending to
be current. That still holds whenever Make is filling the sheet: the read layer
takes the newest `syncedAt`.

A sheet kept by hand has no `syncedAt` values and nothing that can halt. The
read layer then reports the time it read the sheet, so the band stays up
through a quiet month. The embeds show their own dates, so an old post is never
passed off as new. The rule lives in `lib/linkedin/sync.ts` and is tested in
`tests/linkedin-sync.test.mjs`. It switches itself: the first run of Make that
writes `syncedAt` brings the 48-hour check back without a code change.

First correction. If Make only writes when a post exists, a fortnight with no
posts is indistinguishable from a broken integration, and the section hides
itself while everything is working. The scenario has to write a heartbeat on
every run.

Second correction, found 2026-09-22. The handoff's design cannot produce that
heartbeat. When a "Watch company posts" trigger finds nothing new, Make ends the
run at the trigger and no later module executes, so there is nowhere to write
`syncedAt` on a quiet run. A separate heartbeat scenario does not fix it either:
it keeps writing after the LinkedIn authorisation has expired, which is exactly
the failure the heartbeat exists to reveal.

So the scenario does not watch for new posts. Every run lists the most recent
posts and overwrites rows 2 to 9 with them, stamping `syncedAt` on each. The
stamp is only written if the LinkedIn call succeeded, so it means what it
claims. Two side effects:

- A post deleted on LinkedIn drops off the site at the next run, and the sheet
  never grows.
- Deleting a row in the sheet no longer hides a post, because the next run
  writes it back. To take a post off the site, take it down on LinkedIn.

## The Make scenario

### Before building

These describe the finished, CDIE-owned setup. Until handover the sheet is
kept by hand and the scenario waits as a blueprint; see Handover below.

- The scenario lives in CDIE's Make account, not a personal one.
- Point Make's error notifications at a shared inbox, not one person's. These
  things break while someone is on leave.
- LinkedIn connection: authorise as someone who is an admin of the IvE company
  page. If the page does not appear in the organisation list, the account is
  not an admin. The personal IvE profile cannot be used here at all.
- Google connection: the account that owns the sheet after handover.

### Modules

Three billable operations per run. Filters are free.

1. LinkedIn, List company posts. Organisation: the IvE company page, limit 8 to match
   `MAX_POSTS`. Where a sort option exists, choose created date, newest first.
2. Filter on the link after module 1: `lifecycleState` equal to `PUBLISHED`.
3. Tools, Array aggregator, source module 1, one aggregated field per column:
   - `id`: the post `id`
   - `postedAt`: `{{formatDate(publishedAt; "YYYY-MM-DDTHH:mm:ss[Z]"; "UTC")}}`.
     If `publishedAt` arrives as epoch milliseconds, wrap it in
     `parseDate(publishedAt; "x")` first.
   - `text`: `commentary`
   - `syncedAt`: `{{formatDate(now; "YYYY-MM-DDTHH:mm:ss[Z]"; "UTC")}}`
   - `repost`: `{{if(reshareContext; "TRUE"; "FALSE")}}`
   - `url`: `https://www.linkedin.com/feed/update/{{id}}/`
4. Google Sheets, Bulk Update Rows (Advanced). Range `A2:F9` on the feed tab,
   value input option RAW, rows mapped from the aggregator in column order. If
   that module is not offered, use Google Sheets, Make an API Call, with
   `PUT /v4/spreadsheets/{id}/values/A2:F9?valueInputOption=RAW`.

The write covers column F as well, so the hand-kept rows, their formulas and
their links are replaced cleanly on the first run rather than left half
overwritten. Nothing needs clearing by hand at the switch.

Do not use a per-row "Add a row" or "Update a row". They cost one operation per
post on every run and break the budget.

If fewer than eight published posts come back, rows left over from an earlier
run stay in place. They are real CDIE posts, so this is harmless. Adding a
Clear values module on the range before the write removes them at one more
operation per run.

Scenario settings: schedule every 3 hours, error notifications on, storing of
incomplete executions off.

### Budget

| Schedule | Runs per month | Operations per month | Inside 1,000 |
|---|---|---|---|
| Every 2 hours | about 360 | about 1,080 | no |
| Every 3 hours | about 240 | about 720 | yes |
| Every 4 hours | about 180 | about 540 | yes |

Every three hours. A three-hour delay on a post reaching the website is not a
cost anyone will notice, and the 48-hour staleness window absorbs up to fifteen
failed runs in a row. Make now bills in credits; confirm the free allowance on
the account's usage page before relying on these figures. A second scenario on
the same account will eat into the same allowance.

### First run

Use Run once and open the output of module 1. It settles the open questions
below. Then check the sheet: every `id` starts with `urn:li:`, dates look like
`2026-09-22T08:00:00Z`, and `repost` is `TRUE` or `FALSE`.

## Wiring the site

1. In the sheet, File > Share > Publish to web, choose the feed tab and
   comma-separated values, and publish.
2. Put the link in `LINKEDIN_SHEET_CSV_URL`, in `.env.local` and in the hosting
   environment. `config.ts` refuses anything that is not an https
   `docs.google.com` link.
3. Run `npm run dev`, request `/api/linkedin-posts`, and confirm real posts and
   a recent `lastSyncedAt`. Then open `/media`, scroll the band into view, and
   confirm the embeds render.

Google caches a published CSV for a few minutes and the site caches it for ten,
so a change in the sheet can take about fifteen minutes to show.

## Operating it

- The LinkedIn authorisation expires roughly every sixty days. The run fails,
  the shared inbox is told, and after 48 hours the band hides itself and shows
  the link fallback. The fix is reauthorising the connection in Make.
- `linkedInCopy.pageUrl` in `content/linkedin.ts` is still null, so the fallback
  has no link. The IvE company page URL is known (see Which LinkedIn page), but
  which account the site presents as CDIE's is a copy decision; enter it once
  that is settled.

## Handover

CDIE cannot hand out its logins, so everything is prepared in personal
accounts and moved across in one sitting, on the CDIE laptop, signed in to
CDIE's own accounts. No credential changes hands at any point.

The aim is that the sitting is signing in and connecting, nothing more. Two
choices make that possible:

- The sheet moves by ownership transfer, not by copying. Its file ID and its
  published CSV link stay the same, so the site's environment variable is set
  once, now, and never touched on the day.
- The scenario is built ahead of time and exported as a blueprint. On the day
  it is imported, and only its two connections are new.

### Before the sitting

- The sheet is kept by hand, as in Adding a post by hand.
- Publish the sheet to the web and set `LINKEDIN_SHEET_CSV_URL` in `.env.local`
  and in the hosting environment. The posts are real IvE posts, so the live
  site can show them from now on.
- In a personal Make account, build the scenario exactly as in Modules, with
  the Google module pointed at this sheet. The LinkedIn module cannot be tested
  without a page admin, so leave its connection empty. Export Blueprint, and
  keep the JSON file with this document's handover pack.
- Agree with CDIE which Google account will own the sheet, which Make account
  will run the scenario, which account administers the IvE company page, and
  which shared inbox gets failure notices.

### The sitting, on the CDIE laptop

Do these in order. Each step depends on the one before it.

1. From the personal Google account, share the sheet with CDIE's Google
   account and choose Transfer ownership. Accept it from CDIE's account. The
   sheet, its ID and its published link stay as they are.
2. In CDIE's Make account, create a scenario and use Import Blueprint.
3. Create the LinkedIn connection while signed in to the account that
   administers the IvE company page, and select the page in module 1.
4. Create the Google connection with CDIE's Google account. Module 4 keeps
   pointing at the same sheet.
5. Set the notification email to the shared inbox.
6. Run once. Check the sheet against First run above: rows 2 to 9 now carry
   `syncedAt`, and at least one real repost carries `TRUE`. From this run the
   48-hour staleness check is live again, with no code change.
7. Confirm `/api/linkedin-posts` on the live site shows a `lastSyncedAt` from
   step 6. Allow about fifteen minutes for the caches.
8. Turn the schedule on, every 3 hours.
9. Record in this document the date, the accounts that now own the sheet, the
   scenario and the page connection, and what the first run showed about the
   items in Unverified.

### After the sitting

- Delete the personal Make scenario, so two scenarios are never writing.
- Remove the personal Google account's access to the sheet if CDIE wants it.
- Hand CDIE the sixty-day reauthorisation note from Operating it. From now on
  the expiry email reaches their inbox, not yours.

## Unverified

Carried from the handoff, plus what the 2026-09-22 revision assumes. The first
run answers most of them.

- The exact module names and output field names in Make: `List company posts`,
  `Bulk Update Rows (Advanced)`, `publishedAt`, `lifecycleState`,
  `commentary`, `reshareContext`.
- Whether the list module returns post text or only IDs. If only IDs, a "Get a
  company post" module is needed per post and the budget no longer fits.
- Whether `urn:li:ugcPost` works in the embed path. The validator accepts it;
  the embed behaviour is unconfirmed.
- Whether `reshareContext` reliably marks a repost.
- The free-tier allowance under credit billing, and whether the free plan caps
  the scheduling interval.

## Not built

- Parsing and URN validation have no behaviour test. The change-request tests in
  `tests/` only check source text, for example that `RECENT_POSTS` is 3 and
  that the card labels reposts. The staleness rule is tested in `tests/linkedin-sync.test.mjs`.
- No ingest endpoint. Make writes to the sheet, not to this app. If that ever
  changes, a push route needs somewhere to persist and that is a new dependency.
