# CDIE website — change request, 2026-09-13

Status: draft for review
Scope: the `CDIE` repository (Next.js 16, App Router, Tailwind v4)
Author's note: this document expands a set of shorthand review notes into
actionable items. It does not change the source authority in
`docs/BUILD_PLAN.md` §2 — where an item below conflicts with Lucid or the
Actual Copy tab, that conflict is called out in §7 rather than silently
resolved.

## 1. How to read this

Each item states **what changes**, **where**, and **why it matters**. Items are
labelled:

| Label | Meaning |
|---|---|
| `NEW` | Does not exist yet; build it |
| `CHANGE` | Exists; modify the behaviour |
| `DONE?` | Appears already implemented; confirm and close |
| `BLOCKED` | Needs a decision or content before it can be built — see §7 |

---

## 2. Site-wide

### 2.1 Brand mark in place of text wordmarks — `DONE?` / `CHANGE`

replace the current logo with cdie-logo.webp
remove footer text: "contact before travelling"

### 2.2 Link states — `CHANGE`

One rule for every link in the site:

- **No underline at rest.** Already applied in most components via
  `no-underline`; audit for stragglers.
- **Hover:** colour shift plus a visible transition. Never an underline
  appearing on hover, which causes a layout jitter.
- **Active / current page:** carried by colour, not weight or underline. The
  nav already does this (`text-brand` + inset box-shadow); extend the same
  vocabulary elsewhere.
- **Focus-visible is untouched.** The existing 2px `--color-brand-live` outline
  stays — it is an accessibility requirement, not a style choice.

**Why:** underlines are currently suppressed ad hoc per component. This makes
it a system rule so new components inherit it.

---

## 3. Home

### 3.1 Studio capability cards become a carousel — `CHANGE`

`components/sections/VisualCardRail.tsx` already provides a rail and is used on
Home for `serviceCards`. The request applies to the **Design Studio page**,
where capability cards are still a static stack.

Reuse `VisualCardRail` rather than writing a second carousel. If the studio
needs behaviour the rail lacks, extend the rail — do not fork it.

### 3.2 Partner strip — `CHANGE`

`components/sections/PartnerStrip.tsx:19` currently applies
`grayscale transition hover:grayscale-0`.

Remove both. Partner marks render in full colour, at rest, with **no hover
state of any kind**.

Logos are already cropped to their ink and sized by equal optical area in
`public/images/partners/` — leave those dimensions alone.

**Why:** greyscale-until-hover implies the partnerships are decorative and
reads as a stock web pattern. These are institutional endorsements; they should
look permanent. There is also nothing to click, so a hover state promises an
interaction that does not exist.

---

## 4. Programmes

### 4.1 Hero carousel — `DONE?`

`components/sections/ProgrammeHeroCarousel.tsx` exists and is consumed by
`app/page.tsx:46` against `programmeHeroSlides`.

Confirm it is also present on `/programmes` itself, and that each slide draws a
photograph from `public/images/`. Close this item if both hold.

### 4.2 Opportunities become a two-row alternating layout — `CHANGE`

`content/programmes.ts` → `opportunities`, rendered at
`app/programmes/page.tsx:92`.

Replace the current treatment with a two-column row per opportunity: image on
one side, programme information on the other, alternating sides down the page.

Each row carries: image, name, status chip (`open` / `soon` / `enquire` — the
`OpportunityStatus` type already exists), the description, and its action.

**Why:** an image beside the text gives each programme a face and lets a reader
scan by picture. Alternating sides stops four identical rows reading as a table.

### 4.3 Events — `BLOCKED`, see §7.1

Build a card per event holding an image and a short description.

`content/programmes.ts` → `events: CalendarEvent[]` is currently `[]` **by
policy**, with `eventsCopy.empty` as the designed empty state. The `CalendarEvent`
type already exists in `content/types.ts:71`.

The component can be built now against the empty array and the empty state.
Populating it requires a decision — see §7.1.

### 4.4 FAQs collapse — `CHANGE`

`programmeFaqs` (`app/programmes/page.tsx:142`) currently renders as a flat
question-and-answer list. Convert to an accordion: the question is visible, the
answer expands on click.

Apply the same component to `studioFaqs` (`app/design-studio/page.tsx:86`) and
`mediaFaqs`, so there is one FAQ pattern rather than three.

Build it on `<details>`/`<summary>` so it works without JavaScript and is
keyboard-accessible by default. First item may open by default; the rest closed.

### 4.5 Programme descriptions follow the copy source — `CHANGE`

Programme text comes from the Actual Copy tab named in `BUILD_PLAN.md` §2, not
from paraphrase. Where a description has drifted, restore the source wording.

---

## 5. Media

### 5.1 Hero image — `CHANGE`

`content/media.ts` → `mediaLanding`. The hero is currently text-only; add a
photograph from `public/images/`.

### 5.2 Newsletter cards — `NEW`

A card per newsletter issue holding:

- cover image
- issue name (e.g. "IvE Newsletter Issue 6")
- short description
- link to the issue

`MediaItem` (`content/types.ts:122`) already carries a `"newsletter"` kind, so
extend that rather than adding a parallel type.

**Note:** the scrape of the live site found the newsletter posts are little more
than a bare PDF link with no summary. Descriptions will have to be written.

---

## 6. About Us

### 6.1 Team member cards — `CHANGE`

`content/about.ts` → `people: Person[]` (already a typed collection, so the
"create a dict" part of this request is done).

Give each person a discrete card rather than a run-on grid: photograph, name,
role. Per Lucid, a profile needs "picture, name and designation, nothing else",
so resist adding bios unless the copy source supplies them.

### 6.2 Cohorts section renamed and rebuilt — `BLOCKED`, see §7.1

Rename "Our cohorts" to something outcome-led — **"Success stories"** is the
working title; alternatives worth considering: "Where our graduates go",
"What came out of here".

Each card holds: photograph, a short description **or a quote from the person
about the programme**, and links to their social profiles.

`mdiCohorts: Cohort[]` is currently `[]` by policy and `Cohort` exists at
`content/types.ts:146`. Testimonial quotes and social links are new fields and
will need adding to the type.

**Caution:** social links repeat fault F-14 territory. `content/site.ts` already
withholds CDIE's own social accounts until URLs are confirmed. Apply the same
rule per person — render no icon where there is no confirmed URL.

---

## 7. Contact

### 7.1 Auto-select the enquiry subject from the referring page — `NEW`

`content/contact.ts` already provides `enquiryTopics: EnquiryTopic[]` and
`defaultTopicId = "general"`. What is missing is the mapping.

Add a route → topic map, e.g.:

| Arriving from | Pre-selected topic |
|---|---|
| `/programmes`, `/programmes/mdi` | `admissions` |
| `/programmes/invention-education` | `invention-education` |
| `/programmes/design-challenge` | `design-challenge` |
| `/programmes/catalyst-grants` | `catalyst-grants` |
| `/programmes/training` | `training` |
| `/design-studio` | `studio` |
| `/media` | `events` |
| anything else | `general` |

Implementation notes:

- Prefer an explicit query parameter written by the linking page
  (`/contact?topic=studio`) over sniffing `document.referrer`. A referrer is
  absent on privacy-hardened browsers, stripped on cross-origin navigation, and
  unavailable during server rendering. A query parameter is also shareable and
  testable.
- Keep the dropdown fully editable — this is a default, never a lock.
- Fall back to `defaultTopicId` when the parameter is missing or unrecognised.

**Why:** it removes a decision from the person filling in the form, and it
routes the enquiry correctly without asking them to know CDIE's internal
structure.

### 7.2 Remove the travel note from the footer — `CHANGE`

Delete `components/chrome/SiteFooter.tsx:113`,
`<span className="font-mono">Contact the team before travelling.</span>`.

**Keep it** on `app/contact/page.tsx:82` and in `content/studio.ts:189`. Those
are the two places where someone is actually planning a visit.

**Do not delete** `contact.beforeYouTravel` from `content/site.ts` — it is still
read by the pages above. This is a rendering change, not a content deletion.

**Why:** the note exists because the building and floor are disputed (Lucid open
fork fk3: Contacts says 2nd Floor Graduate School, the FAQ says 1st Floor
Chandaria Centre). On every page it reads as an apology; on the two pages about
visiting it reads as useful.

---

## 8. Decisions needed before build

### 8.1 Invented placeholder content vs. the no-invention rule — **blocking**

`content/programmes.ts` states the policy plainly:

> Nothing is confirmed, so the list is empty and the empty state carries the
> wording from the Actual Copy tab. **No event is invented to fill the band.**

and for cohorts:

> Cohort profiles are published once each record is confirmed.

Items **4.3 (events)** and **6.2 (success stories)** both ask for populated
collections. Three ways forward:

1. **Supply confirmed records.** Best outcome. Needs real events with date,
   venue and a live contact; real alumni with their consent for photograph,
   quote and social links.
2. **Build the components, ship them empty.** The component work lands now and
   the collection fills later. Nothing false is published. Recommended if the
   records are not ready.
3. **Populate with clearly-marked placeholders.** Only acceptable behind the
   existing `pending` / flag treatment, and only if the site is not yet public.

Recommendation: **option 2 now, option 1 when records arrive.** This keeps the
build moving without breaking a rule that exists to stop the new site repeating
the old site's credibility problems.

### 8.2 Consent for alumni quotes and photographs

Item 6.2 publishes named individuals, their photographs, their words and links
to their personal social accounts. Confirm written consent per person before
any of it goes live, and confirm each social URL individually.

### 8.3 Which "studio section"

Item 3.1 says "the studio section". Read as the **Design Studio page**
capability cards, since Home already uses `VisualCardRail`. Confirm if Home was
meant instead.

---

## 9. Files this touches

| Area | Files |
|---|---|
| Site-wide | `components/chrome/SiteFooter.tsx`, `components/chrome/SiteNav.tsx`, `app/globals.css` |
| Home | `components/sections/PartnerStrip.tsx`, `components/sections/VisualCardRail.tsx` |
| Programmes | `app/programmes/page.tsx`, `content/programmes.ts`, `content/types.ts` |
| Media | `app/media/page.tsx`, `content/media.ts` |
| About | `app/about/page.tsx`, `content/about.ts` |
| Contact | `app/contact/page.tsx`, `content/contact.ts` |
| New shared | FAQ accordion component (`components/blocks/`), event card, newsletter card, person card, story card |

## 10. Suggested order

1. §2.2 link states and §2.1 footer logo — small, unblock everything visually.
2. §3.2 partner strip — one line removed.
3. §4.4 FAQ accordion — one component, three consumers.
4. §4.2 opportunities two-row layout.
5. §5.1, §5.2 media hero and newsletter cards.
6. §6.1 team cards.
7. §7.1, §7.2 contact topic mapping and footer note.
8. §4.3, §6.2 events and success stories — after §8.1 is decided.

for items that depend on content addition, buildthe cards with simulated data, just to know the look
replace the socials icons used in the footer with good icons, svg from free libraries

