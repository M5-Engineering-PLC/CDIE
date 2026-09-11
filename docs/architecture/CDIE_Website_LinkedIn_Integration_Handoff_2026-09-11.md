# CDIE website: information architecture and LinkedIn integration handoff

Date: 2026-09-11
Track: KU / CDIE (Centre for Design and Innovation in Engineering). Not M5. Do not
mix this into shared M5 documents.
Status: Decisions locked. Nothing built yet. No code written, no repo created.
Purpose: hand the CDIE website work to the chat currently running the prelim build,
so that chat becomes the main session for it.

## Current objective

Rebuild the CDIE website. This handoff covers two settled pieces: the site
information architecture, and how LinkedIn posts reach the Media section.

## Decisions locked

### Information architecture

Five sections. Nav order:

Home > Programmes > Design Studio > Media > About Us > Contact

- Programmes: IvE, MDI, Design Challenge, Events, Masterclasses and Trainings.
  Individual sub-pages exist only for programmes, nothing else.
- Design Studio: the facilities page. Virtual tour comes first on the page, above
  the equipment sections (3D printing, design and CAD, electronics and signal
  processing, metalwork, woodwork, textile and upholstery, co-working).
- Media: events calendar (simplified, gantt-style band per event rather than a
  month grid), upcoming events, newsletters, LinkedIn.
- About Us: explainer, profiles for team and for cohorts.
- Contact: contact form, map, FAQs.

Changes from the earlier version, for anyone who saw it: Events and Masterclasses
moved out of Design Studio into Programmes. Newsletter is no longer top-level and
now sits inside Media. Services as a separate section is gone.

### Landing page layout

From the note of 2026-09-11 (01_daily_streak/7-11_09.txt), which is the current
authority on this:

1. Carousel at the top showing the five sections.
2. Cards for IvE, MDI and the studio.
3. Second carousel for meet the people, event calendar and media.

Home stays minimal and communicates from the first screen. Mobile simplified
exceptionally.

### LinkedIn integration

Chosen: LinkedIn's own post embeds, with the embed URL constructed from the post
URN. Rejected: scraping, and storing a local copy of post text and images.

Discovery runs through Make (make.com) on its free tier, using the LinkedIn
"Watch company posts" trigger against the CDIE organisation page, polled hourly.

No scraper anywhere in the chain. No CDIE LinkedIn developer application is
needed, because the connection authorises through Make's own credentials.

## Verified 2026-09-10 and 2026-09-11

- Make's LinkedIn app has "Watch company posts", "List company posts" and "Get a
  company post" under Companies. Source: https://apps.make.com/linkedin
- Make's built-in LinkedIn connection covers organisation pages. The user needs
  admin access to the LinkedIn page, not their own approved developer app.
  Source: https://community.make.com/t/issues-with-posting-to-a-linkedin-organization-page-need-to-get-linkedin-api/68669
- The trigger returns post URN, commentary (the post text), visibility,
  lifecycle state and timestamp. Images come back as a separate
  urn:li:image URN, not a usable image URL, and need a second call to resolve.
  Source: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- Both urn:li:share and urn:li:activity work in the embed path, so no URN
  conversion is needed.
  Sources: https://designertofullstack.com/embed-a-linkedin-post-on-your-website/
  and https://blog.maxsaxe.design/2017/12/13/how-to-iframe-any-public-linkedin-activity-post/
- Make free tier: no card, no time limit, roughly 1,000 operations a month.

URL construction, from a URN such as urn:li:share:7123456789:

- embed: https://www.linkedin.com/embed/feed/update/urn:li:share:7123456789
- permalink: https://www.linkedin.com/feed/update/urn:li:share:7123456789/

## Not verified — check these during the build

- Whether the Make free plan caps the minimum polling interval. Paid plans go to
  one minute; free has historically been fifteen. Hourly is fine either way, but
  confirm before assuming.
- Whether "Watch company posts" returns ugcPost URNs as well as share URNs, and
  whether urn:li:ugcPost works in the embed path. If it does not, a conversion
  step is needed. This is a thirty-second empirical check on the first real post.
- Whether the trigger returns the post text directly or only IDs. If only IDs,
  chain "Get a company post", which doubles the operation count.

## Architecture agreed

```text
LinkedIn page
     |  Make polls hourly, "Watch company posts"
     v
Make scenario -- builds embed URL from URN --> Store (Google Sheet)
                                                    |
                                        /api/linkedin-posts (thin read layer)
                                                    |
                                              Carousel component
```

Make scenario, four modules: watch company posts, filter on
lifecycleState = PUBLISHED, set variable to build the URLs, add row to the sheet.

Store: a Google Sheet, one row per post. Chosen because it is free, needs no
schema migration, and non-technical staff can fix or remove a row without a
deploy. If the CDIE CMS is built first, the same contract works against it and
only the read function changes.

Read layer: one serverless function, about forty lines. Reads the sheet,
normalises, caches for ten minutes. It exists so the frontend never knows about
the store, so Google is not hit on every page view, and so URN shape is validated
in one place. That last point is a real safeguard: a malformed row must not be
able to put an arbitrary iframe URL on the page.

Carousel: CSS scroll-snap, no library. Native swipe, inertia, keyboard and screen
reader behaviour come free from the browser, and there is no dependency to keep
updated. Each card starts as a lightweight placeholder holding the post text; an
IntersectionObserver swaps in the real iframe only as the card approaches view, so
a ten-card carousel loads one or two iframes rather than ten.

Data contract, fixed now so either side can change independently:

```json
{
  "lastSyncedAt": "2026-09-10T08:00:00Z",
  "posts": [
    {
      "id": "urn:li:share:7123456789",
      "postedAt": "2026-09-08T09:12:00Z",
      "text": "The 2026 MDI cohort spent Thursday...",
      "embedUrl": "https://www.linkedin.com/embed/feed/update/urn:li:share:7123456789",
      "permalink": "https://www.linkedin.com/feed/update/urn:li:share:7123456789/"
    }
  ]
}
```

## Operations budget

One operation per poll plus one per new post. Hourly polling is about 730 a month
plus roughly 15 posts, so about 745 against the 1,000 free allowance. It fits, but
the headroom is thin. A second Make scenario on the same account will break it.

## Known failure mode to build for

Make stops and nothing tells anyone. LinkedIn authorisation expires around every
sixty days, and free-tier operations run out. Either way the scenario halts and
the site keeps showing old posts with no signal that it is broken.

Mitigation: that is what lastSyncedAt is for. If it is older than 48 hours, the
section hides itself or falls back to a plain link out to the LinkedIn page. A
quiet degradation is better than a page confidently showing stale content.

Point Make's failure notifications at a shared inbox, not one person's. These
things break while someone is on leave.

## Remaining tasks, in order

1. Decide where the CDIE website code lives. No repo exists for it yet. This
   blocks everything below and is the first thing the main chat should settle.
2. Build the carousel component. Needed regardless of where posts come from.
3. Build the read function against the data contract above, with a stub file, so
   the frontend can be finished before Make exists.
4. Set up the Make scenario, resolve the three unverified items, point it at the
   sheet.
5. Wire the read function to the real sheet and confirm end to end with a live
   post.
6. Add the lastSyncedAt staleness fallback before the section goes public.

## Related material

- Lucidchart, target IA on page 1, current-site audit on page 2, open forks on
  page 3. The PS is already invited to this document, so edit page 1 in place and
  never create a second chart:
  https://lucid.app/lucidchart/ed616e50-dfd5-4179-8789-116fee3a1b1c/edit
- Stacy's original nav comments: 00_inbox/stacy comments.txt and the near-duplicate
  00_inbox/stcay comments.txt
- Current CDIE page brief and landing-page layout: 01_daily_streak/7-11_09.txt
- Pre-revamp audit, single source of truth for what is on the live site today:
  cdie_website_audit_SSOT.xlsx, in Kiprotich Mololu's Drive folder "CDIE website",
  folder ID 1esxYHscWOSxqu6XtmfnQbc6OTxSRkv2c. Three older
  makerspace_website_audit copies are superseded and must not be edited.

## Warnings

- Do not build a LinkedIn scraper. It needs a logged-in session cookie from a real
  account, which in practice means the CDIE page admin. LinkedIn restricts those
  accounts. The embed route exists specifically to avoid this.
- Do not put ten live iframes in the carousel without the lazy-loading step. It
  will be slow and it loads LinkedIn's tracking on every page view, which affects
  the privacy notice.
- Do not delete CEO files. Do not revert repo changes made by other sessions.
- Three open forks from the audit are still unresolved and sit on Lucidchart page
  3. They do not block this work but they do block launch.
- Unrelated, carried forward from the same note and still untouched: ULTRASIM,
  change the hz and ensure every doc complies.
