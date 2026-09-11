# Architecture decisions

Decisions that shape how the site is built, as opposed to what it says. Filed
here so the build does not depend on a path outside the repository.

| File | What it settles | Status |
|---|---|---|
| `CDIE_Website_LinkedIn_Integration_Handoff_2026-09-11.md` | The information architecture, the landing-page layout, and how LinkedIn posts reach the Media section | Decisions locked, 11 September 2026 |

## Standing of the LinkedIn handoff

It is a decision record, dated after the Lucid revision, and it is authoritative
on the three things it settles. It does not overrule Lucid on structure or the
Actual Copy tab on words, and on the points where it repeats them it agrees.

What it locks:

- Nav order, matching Lucid: Home, Programmes, Design Studio, Media, About Us,
  Contact. Individual sub-pages exist only for programmes.
- The landing page: a carousel of the five sections, then cards for IvE, MDI and
  the studio, then a second carousel for meet the people, event calendar and
  media. Home stays minimal and communicates from the first screen. Mobile
  simplified exceptionally.
- LinkedIn reaches Media through LinkedIn's own post embeds, with the embed URL
  built from the post URN. Scraping is rejected, and so is storing a local copy
  of post text and images.

What it corrects in this repository:

- The build plan previously placed the whole social layer outside release one,
  reading the Lucid control surface against the Actual Copy instruction not to
  claim automatic cross-posting. That reading was too broad. The handoff keeps
  the internal control surface out of scope but puts a read-only LinkedIn
  carousel inside it. Recorded in `docs/BUILD_PLAN.md` section 3.2 and gate 6.
- Its first remaining task was to decide where the website code lives. That is
  now answered: this repository.

## The integration, in short

```text
LinkedIn page
     |  Make polls hourly, "Watch company posts"
     v
Make scenario  -- builds the embed URL from the URN -->  Google Sheet
                                                              |
                                            /api/linkedin-posts, a thin read layer
                                                              |
                                                      Carousel component
```

The parts that matter to the front end:

- The data contract is fixed, so the carousel and the read layer can be built
  before Make exists. Build against a stub file.
- The read layer validates URN shape in one place. A malformed row must not be
  able to put an arbitrary iframe URL on the page. This is a safeguard, not a
  nicety.
- The carousel uses CSS scroll-snap and no library, and swaps a placeholder for
  the real iframe through an IntersectionObserver as a card approaches view. Ten
  live iframes on load would be slow and would run LinkedIn's tracking on every
  page view, which changes what the privacy notice has to say.
- `lastSyncedAt` older than 48 hours hides the section or falls back to a plain
  link out to the LinkedIn page. Make halts silently when its authorisation
  expires or its free-tier operations run out, and a page confidently showing
  stale content is worse than a quiet degradation.
- The free tier has thin headroom: about 745 operations a month against 1,000. A
  second Make scenario on the same account breaks it.

Three items in the handoff are marked unverified and are checked during the
build, not assumed: the free plan's minimum polling interval, whether
`urn:li:ugcPost` works in the embed path, and whether the trigger returns post
text or only ids.
