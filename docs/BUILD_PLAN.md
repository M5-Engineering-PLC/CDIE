# CDIE website — aggregated build plan

Repository: M5-Engineering-PLC/CDIE
Author: Munene Mwaniki (CEO review)
Date: 2026-09-10, amended 2026-09-11
Status: draft for approval at Gate 0

## 1. Purpose

This plan governs the build of the new public website for the Centre for Design
Innovation and Engineering (CDIE). The site must read as a professional pitch to
three audiences: prospective students, university partners, and sponsors.

The plan defines the architecture, the component contract, the split of work
between agents, and eight gates. No stage starts before the gate in front of it
closes.

## 2. Source authority

The Lucid document CDIE Website Skeleton is the single source of truth. Where a
question is about structure, this plan follows Lucid. Where a question is about
words, this plan follows the Actual Copy tab. Neither is overruled by an earlier
concept file, and neither is overruled by this plan.

| Layer | Source | Authority over |
|---|---|---|
| Structure | Lucid, CDIE Website Skeleton, `ed616e50-dfd5-4179-8789-116fee3a1b1c`, page 1 Target IA | Navigation order, page set, what sits under what, what is retired |
| Current state | Lucid page 2, Current site, 49 routes audited 2026-08-20 | Route inventory, keep/revise/merge/cut decisions, fault register |
| Open questions | Lucid page 3, Open forks | Which structural questions are still unanswered |
| Words | Google Doc, Actual Copy tab, `1dDpOhucEq4358mg5nLpFWAYdhhIaG5ZCYia8CRZ1zvw` | Every headline, button label, field label, FAQ and tone note |
| Visual direction | Cinematic arrival render and room explorer render, selected 2026-09-09 | Hero composition and the studio explorer interface |
| Behaviour | `docs/reference/CDIE_Website_Flow_Review_2026-09-10.html`, the Codex flow and architecture brief | Section order within each page, carousel rules, the studio scene states, the accessible alternative, resource handling |
| Studio geometry | Local Three.js prototype, `createDesignStudioModel()` | The room model inside Design Studio |
| Integration decisions | `docs/architecture/CDIE_Website_LinkedIn_Integration_Handoff_2026-09-11.md` | The landing-page layout, and how LinkedIn posts reach Media: embeds built from the post URN, discovered by Make, stored in a sheet, read through one function |
| Build mechanics | This document | Stack, component contract, branches, gates |

Superseded. The seven concept pages in Drive (landing, programme, services,
stories, engage, about, contact) predate this navigation order and do not match
it. Lucid records that as open fork fk2. This plan closes it: those pages are
visual reference only and no route is built from them. Section 5 of the previous
version of this plan named that eight-page set as the build list. It is replaced
by section 5 below.

Also carried forward from the earlier remediation work:

- The front-end framework is fixed to Next.js.
- The audit maps about 49 live routes down to about 20.
- Fault F-04 is inconsistent contact details across pages.
- Fault F-14 is nine legacy event recaps held as raw pasted LinkedIn text.
- The v2 tokens were later sampled from the pixels of `cdie-logo.webp`. That
  closes Lucid fork fk4, which recorded the palette as never sampled.

Remediation of the current live site is tracked outside this repository, in
the CEO workspace note CDIE_Website_live_site_fixes_2026-09-11. This
repository holds the rules that audit produced, not the findings themselves.
The repository is public; the findings name people and mailboxes and are not.

## 3. Information architecture

Navigation order, from Lucid: Home, Programmes, Design Studio, Media, About Us,
Contact. All six labels stay visible on desktop. Mobile uses a labelled menu.

Only Programmes has child pages. Studio services, people, cohorts and media
detail stay inside their main page as selections and expanded panels, with the
selection held in the URL so a shared link opens the same state.

| Route | Children | What lives there |
|---|---|---|
| `/` | none | Five-destination hero carousel; IvE, MDI and Design Studio cards; a People, Events and Media carousel; footer |
| `/programmes` | `/programmes/invention-education`, `/programmes/mdi`, `/programmes/design-challenge`, `/programmes/catalyst-grants`, `/programmes/training`; section `#events` | Learning model, the four opportunities, the event schedule, FAQs, admissions enquiry |
| `/design-studio` | none | Virtual tour first, then the seven-capability directory, media stage, access and FAQs. State in `?space=` and `?service=` |
| `/media` | none | Featured item, newsletter archive, expandable stories, social links |
| `/about` | none | Explainer, purpose, team profiles, cohort profiles, collaboration |
| `/contact` | `?topic=` | Contact details, topic cards, enquiry form, visit information, map slot |

Out of the main navigation: `app.cdie.co.ke`, the studio and lab management
application behind login. Lucid keeps it as a utility only. It gets one footer
link and nothing else. Lucid fork fk6 records that nobody has described what it
does; it stays out of scope until somebody has.

Retired in this remap, from Lucid page 1: `/student-blogs/`, `/blog/`,
`/blog/newsletter/`, `/category/newsletter/`, `/service-category/cdie/`, the two
`/team-member/` archive pages, `/team-group/consultants/`, the tag, date and
author archives, and the two theme-demo staff profiles.

### 3.1 How the Lucid blocks map onto the pages

Every block on the Lucid map has a home. Nothing was dropped in the reading.

| Lucid block | Where it goes | Note |
|---|---|---|
| Virtual Tour, first on the page | `/design-studio`, above everything | Lucid says it covers the landing area and is clicked into the sections |
| Design and CAD, Electronics and Signal Processing, 3D Printing, Metalworking, Woodworking, Textile and Upholstery, Co-working Space | Selections inside `/design-studio` | Lucid draws them as seven blocks; the confirmed structure keeps them in one page |
| IvE, MDI | `/programmes/invention-education`, `/programmes/mdi` | Lucid nests MDI under IvE as the flagship track. Routing keeps them siblings; the IvE page carries the relationship in prose |
| Design Challenge, Catalyst grant, Masterclasses and Trainings | Programme child pages | Lucid moved Masterclasses out of Design Studio and into Programmes |
| Events Calendar, Upcoming Events | `/programmes#events`, previewed on `/` and linked from `/media` | See the resolution below |
| Newsletters | `/media` | Lucid: opens the published issue directly in a new tab, with no intermediate click |
| Explainer, Profiles Team, Profiles Cohorts | `/about` | Lucid: a profile needs picture, name and designation, nothing else |
| Contact Form, Map, FAQs | `/contact` | See the FAQ conflict below |
| LinkedIn | `/media`, as a read-only embed carousel | Locked by the integration handoff of 11 September |
| Instagram, YouTube | Links only, once each account URL is confirmed | Copy forbids displaying a feed before the destination is verified |
| One control surface | Not in release one | An internal operations concern, not a public page |
| Login | Footer link only | |

### 3.2 Conflicts inside the sources, and how this plan reads them

These are recorded rather than quietly resolved, because each one is a place
where two authoritative documents disagree.

Event ownership. The Lucid map hangs Events Calendar and Upcoming Events under
Media, but the same page's revision note says events moved out of Design Studio
and into Programmes, and the Upcoming Events block itself says it links into the
Programmes event page. Fork fk0 offers a third position. The Actual Copy tab
settles it: Programmes carries the event entry, and the Media page says only
"Explore programme events". Reading: one set of event records, owned by
Programmes. Home and Media render views of those records and never hold a date
of their own.

FAQs. Lucid places a single FAQ block under Contact, covering access, cost,
booking, who can use the studio and application timing. The Actual Copy tab
instead writes Programme FAQs into Programmes and Studio FAQs into Design
Studio, and gives Contact no FAQ section. Reading: each FAQ sits with its own
topic, because that is where the answer is useful, and Contact links to both.
This is a real deviation from the Lucid map and needs a yes, recorded as D2.

Social integration. Lucid designs a control surface with a bidirectional
LinkedIn feed. The Actual Copy tab forbids claiming automatic cross-posting in
public copy and requires confirmed account URLs before any feed is displayed.
The integration handoff of 11 September then settled the mechanism.

Reading, and it is narrower than an earlier draft of this plan had it: the
read-only LinkedIn carousel is in release one, built from LinkedIn's own post
embeds. What stays out is the bidirectional half and the control surface. The
site pulls posts in; it never claims to publish out, which is exactly what the
copy instruction forbids. Instagram and YouTube stay as plain links until their
account URLs are confirmed.

The catalyst grant amount. Lucid states a 500 dollar grant. The Actual Copy tab
records that the source announcement lists different awards for different
applicant groups and instructs that no amount is published until the current
call is confirmed. Reading: the copy authority wins on a published figure. The
page describes what the grant enables and names no number.

Above the fold on Home. Lucid asks for minimal above the fold, one clear line
and one action. The Actual Copy tab specifies a carousel previewing the five
other pages. Reading: both hold if each slide carries one short line and one
action over a full-bleed photograph, which is also the selected cinematic
reference. The Lucid programme carousel becomes the three static cards, and the
Lucid strip of latest media becomes the lower carousel.

The naming of the studio's two sides. Lucid names them Design Studio and ATC,
and the public route is /design-studio. The client review of 11 September
instructs that the two sides are Graduate School and ATC, and moves textiles and
upholstery across from ATC to the first of them. Reading, decided 11 September:
the space label changes and the route does not. The centre's own manager names
the sides, so the label follows her; /design-studio is a public URL and the page
covers both sides, so it stays. Recorded as R9 in the Lucid update note, which
is where Lucid gets corrected.

One consequence worth stating, because it is the kind of thing that rots
quietly. Textiles is now Graduate School but still has no documented position in
the room, so the explorer's unplaced-capability message can no longer say the
capability is held at the ATC. It says nothing documents where the capability
sits, which is the true statement for all three unplaced ones and stays true
whichever side they belong to.

The source of R9, and of the other four review items numbered R10 to R13, is a
machine transcript of poor quality in which speaker attribution is unreliable.
The corrections pass lives with the meeting record outside this repository. Do
not treat a line of that transcript as copy.

#### Conflict C-06, 2026-09-21. The events calendar cannot be populated yet

The change request of 21 September asks for the Media events calendar to be
populated by searching the CDIE Invention Education LinkedIn account and
transcribing what is there into the Gantt calendar.

The calendar itself is built and is the first band on Media. It is not
populated, and it is not populated for a reason that is worth writing down
rather than working around.

- The build environment has no route to linkedin.com. The account's activity
  page cannot be read from here, so there is no source to transcribe.
- The claim-safety rule in AGENTS.md is the binding constraint even if there
  were. An event carries a date, a venue and usually a registration route, and
  every one of those is a published fact. A date recovered from a post that
  nobody has checked is exactly the kind of unsupported fact the audit of the
  current site found, and it would be published under CDIE's name.

So the calendar ships empty, with the enquiry wording, and the sample bars sit
behind SHOW_SAMPLE_CONTENT so the band can be reviewed.

What unblocks it, in order of preference:

1. CDIE supplies the confirmed events directly: title, start, end where the
   event runs more than a day, venue, and a registration link where one exists.
   They go into the `events` array in `content/programmes.ts`, which is the
   single record both Programmes and Media read.
2. Someone with access to the account exports or lists the relevant posts, and
   a person confirms each derived date against CDIE's own record before it is
   entered.

Neither route changes a line of component code. The calendar renders whatever
the record holds.

### 3.3 Review feedback of 11 September, and where it collides with Lucid

Three review documents arrived on 11 September: a UX and structure revision
blueprint, homepage comments from Mololu (`v1_comments.txt`, Drive
`1DocG_kO1k9GftMb8fY39EiQSDthuZIo8`), and a sampled palette file. None of the
three is a source authority under section 2. They are review of the v1 build,
which makes them valuable and makes them not binding. Where one contradicts
Lucid or the Actual Copy tab, it is recorded here and answered by a person, not
by an agent.

The blueprint is missing its section 2. Whatever it covered has not been read.

All twelve were answered by Munene on 11 September and are built. Where an
answer overrules Lucid, the Lucid document is the thing to change; a note asking
for that sits in the CEO workspace.

| Ref | Answer | Overrules Lucid |
|---|---|---|
| R1 | Home leads with the three programmes. The five-destination carousel is gone | yes |
| TYPE | Sans only: Archivo display, IBM Plex Sans body. Newsreader dropped | no |
| R2 | Studio login joins the navigation bar and keeps its footer link | yes |
| C-01 | The form is wired to ive@ku.ac.ke through a route handler | no |
| R8 | A carousel holds cards that carry a short description and a link | no |
| R4 | All five programme child routes stay | no |
| R5 | Newsletters stay in Media, as cards with a cover that opens the issue | no |
| FAQ | FAQs stay split by topic. This closes D2 | yes, as already recorded |
| R3 | Cohorts move from About Us to the MDI page | yes |
| R6 | Students stays. No terminology change | no |
| R7 | Design Studio keeps its name. Superseded in part by R9 of the client review later the same day: the page keeps the name, the space inside it does not | no, then see 3.4 |
| PEND | Unconfirmed facts keep the rule and change voice | no |
| VISUAL | Home leads with the three-programme photographic carousel; services and latest use the supplied image folder | yes, replaces the short text hero |
| PARTNERS | Use the four supplied, cropped marks: Kenyatta University, Rice University, Rice360 and The Lemelson Foundation | no |
| SOCIAL | Use the four account destinations published by the current CDIE site: LinkedIn, Instagram, Facebook and X | no |
| TOUR | Use the two approved concept renders as the studio entrance and explorer preview; retain the existing illustrative Three.js geometry | no. Reversed the same day: both renders were screenshots of a fictional CDIE website and were removed for a photograph |

Conflicts as they were raised:

R1. The Home destination carousel. The confirmed structure and the Actual Copy
tab put a five-destination carousel at the top of Home. The blueprint calls that
duplicate navigation, since the same six labels sit in the navigation bar, and
Mololu's comments replace it with a carousel of the three programmes. Two
independent reviewers arrived at the same objection separately, which is the
strongest signal in the whole set.

R2. Login. Lucid keeps `app.cdie.co.ke` as a footer utility and fork fk6 records
that nobody has described what it does. The blueprint and Mololu both want it in
the navigation bar. The reviewers agree against Lucid.

R3. Cohorts. Lucid puts Profiles Cohorts under About Us and the confirmed
structure keeps them there. The blueprint moves them into MDI as programme
evidence.

R4. Programme child pages. Lucid gives Programmes five children. The blueprint
argues that Design Challenge, Catalyst Grants and Training are thin pages and
should be sections inside IvE until there is enough content to justify a route.
The catalyst grants page currently publishes no figure and little else, so the
observation is accurate.

R5. Newsletters. Lucid puts newsletters inside Media, opening the published
issue directly. The blueprint wants a dedicated chronological archive page. The
stakeholder comments of 5 September independently propose newsletters as their
own destination.

R6. Terminology. The blueprint asks for "students" to become "innovators" where
academic status is not the subject. Words are the Actual Copy tab's authority.
This cannot be applied in code; it is a change to the copy document first.

R7. The Design Studio name. Mololu asks whether it should be called Working
Space. Lucid and the Actual Copy tab both say Design Studio.

R8. Carousels. The blueprint says essential information must not sit behind a
carousel. Mololu's homepage is three carousels. The two review documents
contradict each other, and R1 cannot be answered without answering this.

Not a conflict, and adopted without a decision: the sampled palette, the logo as
the home link, clickable cards, visible hover and focus states, one dominant
call to action per section, and the rewriting of pending copy into public voice.
The last of these is section 13 of the blueprint and it is correct: the rule
that an unconfirmed fact never publishes stays exactly as it is, but the reader
should see an invitation to ask, not an internal gap marker.

### 3.4 Client review of 11 September, and what was built from it

Sections 3.2 and 3.3 record an internal review round. This section records a
different kind of input: Stacy Awinja, the CDIE manager, walked through the built
site and gave feedback as the client. Where 3.3 weighed reviewers against each
other, here the centre is describing itself, which settles several questions that
no document had settled.

Her overall verdict was that the structure is right and the photographs are what
needs replacing. The meeting record, including the corrections pass that the
transcript needs before anything in it is quoted, is in the CEO workspace at
11_cdie/CDIE_Website_review_meeting_2026-09-11.md.

| Ref | Change | Built |
|---|---|---|
| R9 | The two sides are Graduate School and ATC, and textiles and upholstery belongs to the first | yes, label and membership; the route is unchanged, see 3.2 |
| R10 | A sixth programme, the Summer Program | no. No source describes it. The box stays empty rather than carrying an invention |
| R11 | The enquiry button sits on each programme's page and carries that programme's topic | yes |
| R12 | The MDI page lists the curriculum by semester | no. Nobody has the unit list |
| R13 | The repeated explanatory block below the studio detail is removed | yes |

Two things found while building R11 that the review did not ask for and that
were wrong anyway. The catalyst grants button pointed at an enquiry topic that
had never existed, so the form silently reclassified those enquiries as general;
every programme now owns a topic and a test asserts that each one resolves. And
the asset test still required the two tour mockups deleted in ec4860c, so the
suite could not pass on a clean checkout.

The rest of the review is waiting on material from CDIE and cannot be worked
around: replacement photographs for design and CAD and for 3D printing, ATC
photography that does not yet exist, cohort one student profiles, newsletter
issues, the reports login, and the remaining team members. The programme cards
accept a photograph and render without one until it arrives. The full list with
owners is in the meeting record.


## 4. Target architecture

Stack:

- Next.js, App Router, TypeScript in strict mode.
- Tailwind CSS v4, with the sampled tokens declared once in a theme block.
- No CMS in the first release. Content lives in typed TypeScript data modules.
- Three.js for the studio room only, loaded on the Design Studio route.
- Deployment on Vercel, preview per pull request.

Reason for Tailwind over hand-written CSS: two agents write code in parallel on
this repository. Utility classes bound to one token file stop the palette and
the spacing scale from drifting between branches. A hand-written stylesheet
drifts within a week.

Reason for no CMS yet: the CMS decision is open. If content sits behind a typed
data module with one read function per collection, a later CMS swap changes the
data layer only, and no component changes.

Directory layout:

```
app/                 routes and page compositions only
components/
  primitives/        Button, Kicker, Chip, Prose, Field
  blocks/            Card, PersonCard, NewsletterCard, EquipmentRow
  sections/          Hero, PageHero, StudioExplorer, EventSchedule, FAQ
  chrome/            SiteNav, SiteFooter, Breadcrumbs, SkipLink
  studio/            the Three.js viewer and its React boundary
content/             typed data modules, one per collection
lib/                 helpers, no JSX
styles/theme.css     the single token declaration
public/              images and fonts
docs/                this plan, the decision log, the gate records
tests/               contract and accessibility tests
```

Rules that make the layout hold:

- A file in `app/` composes sections. It declares no styles of its own.
- A section composes blocks and primitives. It accepts content as props.
- No component reads from `content/` directly. Routes read the data and pass it
  down. This keeps every component testable in isolation.
- No hard-coded hex value, font stack, or spacing number outside
  `styles/theme.css`.
- No component file is longer than 150 lines. If it grows, split it.
- Nothing in `components/studio/` imports from `content/`. The viewer receives a
  service id and emits a service id. All copy and media live in HTML beside it.

## 5. The component contract

Every component ships with five things. A component without all five is not
done, and it does not pass a gate.

1. A named export and an exported TypeScript props type.
2. A default state that renders with no optional props.
3. An entry in the preview route at `/preview`, showing every state.
4. Responsive behaviour verified at 375 px, 768 px, and 1440 px.
5. Keyboard and screen-reader behaviour: visible focus, correct roles, alt text.

Each component also names its source. Put this in a one-line comment at the top
of the file, giving the Lucid block for structure and the Actual Copy heading
for words, for example:
`// Lucid: Design Studio > Virtual Tour. Copy: DESIGN STUDIO > Virtual tour.`

## 6. Component inventory

This is the build list. The count drives the gates.

Primitives: Button, Kicker, Chip with status states of open, soon and closed,
Prose, Field, Icon.

Blocks: Card, OpportunityCard, PersonCard, CohortCard, NewsletterCard,
StoryTeaser, EquipmentRow, EventBand.

Chrome: SiteNav, SiteFooter, Breadcrumbs, SkipLink.

Sections, by the page that needs them:

| Page | Sections |
|---|---|
| Home | DestinationCarousel, ProgrammeCards, FeatureCarousel |
| Programmes | PageHero, LearningModel, OpportunityGrid, EventSchedule, FAQ, EnquiryCTA |
| Design Studio | StudioIntro, StudioExplorer, SpaceSwitch, CapabilityDetail, AccessBlock, FAQ |
| Media | FeaturedItem, NewsletterArchive, ArchiveFilters, StoryPanel, LinkedInCarousel, SocialLinks |
| About Us | Explainer, PurposeTriad, PersonGrid, PersonPanel, CohortSelector, CohortPanel, CollaborateBlock |
| Contact | ContactDetails, TopicCards, EnquiryForm, VisitBlock, MapSlot |

StudioExplorer is four parts under one section: the capability list, the media
stage with its photo and video switch, the compact room navigator, and the
inline detail panel. One selected id drives all four.

Pages: Home, Programmes, Invention Education, MDI, Design Challenge, Catalyst
grants, Masterclasses and training, Design Studio, Media, About Us, Contact.
Eleven routes, plus the redirect map.

One route handler: `/api/linkedin-posts`. It reads the store, normalises to the
data contract in the integration handoff, validates URN shape, and caches for ten
minutes. URN validation lives here and nowhere else: a malformed row must not be
able to put an arbitrary iframe URL on the page.

Content collections in `content/`: Page, Programme, Opportunity, Event, Service,
Space, MediaItem, Person, Cohort. Each record carries a stable id, title,
summary, full content, image with caption, destination and publication status.
A Service record references a Space and an optional model hotspot id. An Event
stores its dates once.

## 7. Who does what

| Lane | Owner | Work |
|---|---|---|
| Architecture, tokens, chrome, review | CEO review session (this session) | Scaffold, `styles/theme.css`, SiteNav, SiteFooter, every gate judgement |
| Primitives and blocks | Codex, through the codex rescue agent | Small, well-specified components with a fixed props type |
| Sections | Claude, m5-implementer agent | Composition work against the selected renders |
| Studio viewer | CEO review session | The Three.js boundary, loading states and the no-3D path |
| Page assembly | CEO review session | Routes, metadata, content wiring |
| Content extraction | Claude, m5-implementer agent | Port Actual Copy into `content/` |

Rules for parallel work:

- One agent owns one branch. One branch touches one lane.
- No two open branches edit the same file.
- `styles/theme.css` is owned by the CEO review session only. If an agent needs
  a new token, the agent requests it. The agent does not add it.
- Every brief states the outcome, the files, the Lucid block, the Actual Copy
  heading, and the check.

## 8. Branch and integration rules

- Branch names: `feat/<lane>-<component>`, for example `feat/blocks-person-card`.
- One pull request per component group, never a mixed pull request.
- A pull request merges only after the preview deployment renders, the checks
  pass, and the CEO review session approves.
- Commit messages describe one behaviour change.
- `main` stays deployable at every commit.

## 9. The gates

Each gate has an exit test. Record the result in `docs/gates/G<n>.md` before the
next gate starts.

### Gate 0 — Decisions and scaffold

Work: answer the decisions in section 10. Create the Next.js scaffold,
TypeScript, Tailwind, ESLint, Prettier, the Vercel project, and the preview
route. Import the brand assets.

Exit test:
- Every decision in section 10 has a recorded answer or a recorded deferral with
  the work it blocks.
- `npm run build` passes.
- The preview deployment serves an empty styled page.

### Gate 1 — Tokens locked

Work: declare the sampled tokens in `styles/theme.css`. Set up the type scale,
the spacing scale, and the focus style. Self-host the fonts.

Exit test:
- A token page renders every colour, type step, and spacing step.
- The colour pairs meet WCAG 2.1 AA contrast.
- A grep for hex values outside `styles/theme.css` returns nothing.
- No layout shift from font loading.

Gate 1 is a hard freeze. After it closes, a token change needs a written note.

### Gate 2 — Primitives

Work: build the six primitives against the contract in section 5.

Exit test:
- `/preview` shows every primitive in every state.
- Keyboard traversal reaches every interactive primitive.
- No primitive imports a section or a block.

### Gate 3 — Blocks

Work: build the eight blocks. Feed them fixture data, not real content.

Exit test:
- `/preview` shows every block at 375 px, 768 px, and 1440 px.
- Every block renders with an empty list and with a long string, without
  breaking the layout.
- Images use `next/image` with explicit dimensions.
- EventBand renders a single-day event and a multi-day event correctly, and
  degrades to a plain list below 768 px.

### Gate 4 — Sections and chrome

Work: build the sections in section 6, and the chrome.

Exit test:
- Each section names its Lucid block, and the CEO review session confirms the
  section matches that block and the selected render.
- The navigation carries the six Lucid labels in the Lucid order, works with the
  keyboard, and works on a 375 px screen.
- No section holds hard-coded copy.

### Gate 5 — The studio

Work: mount `createDesignStudioModel()` behind a poster and a loading state.
Wire the four modelled capabilities to the detail panel. Build the honest path
for the three that have no mapped area.

Exit test:
- The page reads and navigates fully before the model loads, and if it never
  loads.
- Every hotspot has an equivalent labelled HTML button.
- Selecting a capability moves the list, the highlight, the media and the panel
  together, and writes `?service=` to the URL.
- Metalworking, textiles and woodworking present photographs and text, with no
  invented position in the room and no drawn second space.
- The viewer releases geometry, materials and textures when it unmounts, and
  stops animating off screen.
- Reduced motion selects without camera travel.
- Page scrolling still works around the viewer on a phone.

### Gate 6 — Pages and content truth

Work: assemble the eleven routes. Port Actual Copy into `content/`. Apply the
route map from the audit, with redirects from the retired routes.

Exit test:
- Contact details are identical across every page and come from one module.
  This closes fault F-04.
- Every legacy event recap is edited to house tone. This closes fault F-14.
- Every claim about partners, funding, numbers and dates traces to a source. Any
  claim without a source is removed, not softened. The catalyst grant figure is
  absent unless the current call has been confirmed.
- No `[TBD]` marker and no editorial note from the source document appears in a
  public field.
- An action button exists only where its destination is live. Otherwise the page
  carries the enquiry wording from the Actual Copy tab.
- Every retired route returns a 301 to its mapped replacement.
- No theme demo profile from the previous site exists in the new content.
- The LinkedIn carousel renders from the stub file, loads at most two iframes on
  first paint, and hides itself or falls back to a plain link out when
  `lastSyncedAt` is older than 48 hours. The privacy notice says that opening the
  section loads LinkedIn's embed and its tracking.

Gate 6 is the claim-safety gate. The CEO review session runs it. No agent
approves it.

### Gate 7 — Quality

Work: run the full quality pass.

Exit test:
- Every fault in the defect sheet is marked fixed, moved, or dropped with a
  reason.
- Lighthouse on mobile: performance at or above 90, accessibility at 100.
- axe reports no violation on any route.
- The site works with JavaScript disabled for reading and navigation.
- The de-vibecode review passes. The page must not read as generated.
- Test on a real mid-range Android phone on a mobile network, including the
  Design Studio route.

### Gate 8 — Packaging and freeze

Work: write the handover. Set the production domain, the redirects, the sitemap,
the robots file, and the Open Graph images.

Exit test:
- `README.md` explains how to run, build, and deploy the site.
- `docs/CONTENT.md` explains how a non-developer edits copy.
- A tagged release exists.
- After the tag, the site is frozen. A change needs a new branch and a new gate
  record.

## 10. Open decisions

Lucid page 3 holds seven open forks. Three are answered by later work. The rest
block Gate 0, together with the decisions this reading added.

| Id | Question | Source | State |
|---|---|---|---|
| D1 | Which address is real: 2nd Floor Graduate School, or 1st Floor Chandaria Centre | Lucid fk3, fault F-04 | Open. Blocks the Contact page, the map and the visit copy. No default |
| D2 | Do FAQs sit with their topic, or in one block under Contact | Lucid map against Actual Copy | Open. Recommend with the topic |
| D3 | Where does the archive of nine event recaps live | Lucid fk0 | Open. Recommend Media, with dates and registration owned by Programmes |
| D4 | Route cutover: the full remap at once, or a gradual wind-down | Lucid fk5 | Open. Recommend at once, with 301s for every retired route |
| D5 | Publish the catalyst grant amount | Lucid states 500 dollars, Actual Copy says confirm first | Open. Recommend no figure until the current call is confirmed |
| D6 | Does `/students/` resolve | Lucid fk7 | Open. Verify before mapping or redirecting it |
| D7 | What `app.cdie.co.ke` does | Lucid fk6 | Open. Out of scope for this build either way. One footer link |
| D8 | MDI facts: 18 months, full-time, in person | Actual Copy, unverified since August | Open. Confirm with the programme owner before publication |
| D9 | Studio access policy, booking and charges | Actual Copy, all marked TBD | Open. Recommend the MDI-linked access line and an enquiry, not a booking flow |
| D10 | The word that replaces "Services" | Lucid fk1 | Closed by Lucid itself. The section is gone; Design Studio is the facilities page. "Capabilities" labels the in-page directory |
| D11 | Do the seven August concept pages survive | Lucid fk2 | Closed. Visual reference only. No route is built from them |
| D12 | Brand palette | Lucid fk4 | Closed. The v2 tokens were sampled from `cdie-logo.webp`. Confirm at Gate 1 |
| D13 | CMS | Decision record | Closed for release one. Typed content modules, no CMS |
| D14 | Hosting | Decision record | Closed. Vercel. Confirm the backup arrangement |
| D15 | Where the website code lives | Integration handoff, first remaining task | Closed. This repository, `/home/munene/code/CDIE` |
| D16 | Make free-tier polling floor, `urn:li:ugcPost` in the embed path, whether the trigger returns post text | Integration handoff, marked unverified | Open. Empirical checks during build step 4. None of them blocks the front end, which builds against the stub |
| D17 | Which shared inbox receives Make's failure notifications | Integration handoff | Open. It must not be one person's address |

## 11. Risks

- Two agents edit one file and the merge destroys work. Control: section 8.
- Token drift produces a page that looks close but not right. Control: Gate 1.
- Unsourced claims about partners reach a sponsor. Control: Gate 6.
- The build is beautiful on a laptop and slow on a Kenyan phone. Control: the
  device test in Gate 7.
- The studio viewer becomes the page rather than a component in it. Control:
  Gate 5, where the page must work fully without the model.
- A capability is drawn into the room because the model has space for it.
  Control: Gate 5. Position comes from the layout module or from nothing.
- Scope grows into the studio and lab management system behind
  `app.cdie.co.ke`. That system is out of scope for this plan.
