# CDIE website — aggregated build plan

Repository: M5-Engineering-PLC/CDIE
Author: Munene Mwaniki (CEO review)
Date: 2026-09-10
Status: draft for approval at Gate 0

## 1. Purpose

This plan governs the build of the new public website for the Centre for Design
Innovation and Engineering (CDIE). The site must read as a professional pitch to
three audiences: prospective students, university partners, and sponsors.

The plan defines the architecture, the component contract, the split of work
between agents, and eight gates. No stage starts before the gate in front of it
closes.

## 2. What already exists

The work does not start from zero. The prior repository
M5-Engineering-PLC/CDIE-website holds the concrete inputs.

| Input | File | Use in this build |
|---|---|---|
| Audit of the live site | cdie_website_audit_SSOT.xlsx | Route map and fault register |
| Defect sheet, 22 faults | cdie_remediation_brief.html | Acceptance list for Gate 6 |
| Decision record | decision_record.html | Open decisions, see section 9 |
| Design system and concepts | cdie_landing_concepts.html | Token and type source |
| Page concepts, set v1 | cdie_*_page.html | Rejected direction, keep for reference |
| Page concepts, set v2 | cdie_*_page_v2.html | Visual reference for the build |
| Brand assets | cdie-logo.webp, partner logos | Production assets |

Facts carried forward from those files:

- The front-end framework is fixed to Next.js.
- The live site has about 49 routes. The audit maps them down to about 18.
- The v2 tokens are sampled from the pixels of cdie-logo.webp, not invented.
- Fault F-04 is inconsistent contact details across pages.
- Fault F-14 is nine legacy stories held as raw pasted LinkedIn text.

The concept pages are single HTML files with the full stylesheet inline. Each
file repeats the same tokens, the same navigation, and the same footer. That
duplication is the exact problem this build removes.

## 3. Target architecture

Stack:

- Next.js, App Router, TypeScript in strict mode.
- Tailwind CSS v4, with the sampled tokens declared once in a theme block.
- No CMS in the first release. Content lives in typed TypeScript data modules.
- Deployment on Vercel, preview per pull request.

Reason for Tailwind over hand-written CSS: two agents write code in parallel on
this repository. Utility classes bound to one token file stop the palette and
the spacing scale from drifting between branches. A hand-written stylesheet
drifts within a week.

Reason for no CMS yet: the CMS decision is open (section 9). If content sits
behind a typed data module with one read function per collection, a later CMS
swap changes the data layer only, and no component changes.

Directory layout:

```
app/                 routes and page compositions only
components/
  primitives/        Button, Kicker, Chip, Prose, Field
  blocks/            Card, StatTile, PartnerLogo, StoryTeaser
  sections/          Hero, PageHero, PartnerStrip, CTABand, FAQ
  chrome/            SiteNav, SiteFooter, SkipLink
content/             typed data modules, one per collection
lib/                 helpers, no JSX
styles/theme.css     the single token declaration
public/              images and fonts
docs/                this plan, the decision log, the gate records
tests/               contract and accessibility tests
```

Rules that make the layout hold:

- A file in app/ composes sections. It declares no styles of its own.
- A section composes blocks and primitives. It accepts content as props.
- No component reads from content/ directly. Routes read the data and pass it
  down. This keeps every component testable in isolation.
- No hard-coded hex value, font stack, or spacing number outside styles/theme.css.
- No component file is longer than 150 lines. If it grows, split it.

## 4. The component contract

Every component ships with five things. A component without all five is not
done, and it does not pass a gate.

1. A named export and an exported TypeScript props type.
2. A default state that renders with no optional props.
3. An entry in the preview route at /preview, showing every state.
4. Responsive behaviour verified at 375 px, 768 px, and 1440 px.
5. Keyboard and screen-reader behaviour: visible focus, correct roles, alt text.

Each component also names the concept file and the section it comes from. Put
this in a one-line comment at the top of the file, for example:
`// Source: cdie_landing_page_v2.html, .hero`.

## 5. Component inventory

This is the build list. The count drives the gates.

Primitives: Button, Kicker, Chip with status states of open, soon and closed,
Prose, Field, Icon.

Blocks: Card, ProjectCard, PersonCard, StoryTeaser, StatTile, PartnerLogo,
EquipmentRow.

Sections: SiteNav, SiteFooter, Hero, PageHero, PartnerStrip, ProcessSteps,
CardGrid, StoryList, EquipmentTable, ContactBlock, EnquiryForm, CTABand, FAQ.

Pages: Home, About, Programme, Services, Stories, Story detail, Engage, Contact.

## 6. Who does what

| Lane | Owner | Work |
|---|---|---|
| Architecture, tokens, chrome, review | CEO review session (this session) | Scaffold, styles/theme.css, SiteNav, SiteFooter, every gate judgement |
| Primitives and blocks | Codex, through the codex rescue agent | Small, well-specified components with a fixed props type |
| Sections | Claude, m5-implementer agent | Composition work against the v2 concepts |
| Page assembly | CEO review session | Routes, metadata, content wiring |
| Content extraction | Claude, m5-implementer agent | Port copy from the concepts into content/ |

Rules for parallel work:

- One agent owns one branch. One branch touches one lane.
- No two open branches edit the same file.
- styles/theme.css is owned by the CEO review session only. If an agent needs a
  new token, the agent requests it. The agent does not add it.
- Every brief states the outcome, the files, the source concept, and the check.

## 7. Branch and integration rules

- Branch names: `feat/<lane>-<component>`, for example `feat/blocks-project-card`.
- One pull request per component group, never a mixed pull request.
- A pull request merges only after the preview deployment renders, the checks
  pass, and the CEO review session approves.
- Commit messages describe one behaviour change.
- main stays deployable at every commit.

## 8. The gates

Each gate has an exit test. Record the result in docs/gates/G<n>.md before the
next gate starts.

### Gate 0 — Decisions and scaffold

Work: resolve the open decisions in section 9. Create the Next.js scaffold,
TypeScript, Tailwind, ESLint, Prettier, the Vercel project, and the preview
route. Import the brand assets.

Exit test:
- Every decision in section 9 has a recorded answer.
- `npm run build` passes.
- The preview deployment serves an empty styled page.

### Gate 1 — Tokens locked

Work: declare the sampled tokens in styles/theme.css. Set up the type scale,
the spacing scale, and the focus style. Self-host the fonts.

Exit test:
- A token page renders every colour, type step, and spacing step.
- The colour pairs meet WCAG 2.1 AA contrast.
- A grep for hex values outside styles/theme.css returns nothing.
- No layout shift from font loading.

Gate 1 is a hard freeze. After it closes, a token change needs a written note.

### Gate 2 — Primitives

Work: build the six primitives against the contract in section 4.

Exit test:
- /preview shows every primitive in every state.
- Keyboard traversal reaches every interactive primitive.
- No primitive imports a section or a block.

### Gate 3 — Blocks

Work: build the seven blocks. Feed them fixture data, not real content.

Exit test:
- /preview shows every block at 375 px, 768 px, and 1440 px.
- Every block renders with an empty list and with a long string, without
  breaking the layout.
- Images use next/image with explicit dimensions.

### Gate 4 — Sections and chrome

Work: build the thirteen sections. Match the v2 concepts.

Exit test:
- Each section sits beside a screenshot of its source concept, and the CEO
  review session confirms the match.
- The navigation works with the keyboard and on a 375 px screen.
- No section holds hard-coded copy.

### Gate 5 — Pages and content truth

Work: assemble the eight routes. Port the copy into content/. Apply the route
map from the audit, with redirects from the retired routes.

Exit test:
- Contact details are identical across every page and come from one module.
  This closes fault F-04.
- Every legacy story is edited to house tone. This closes fault F-14.
- Every claim about partners, funding, and numbers traces to a source. Any
  claim without a source is removed, not softened.
- Every retired route returns a 301 to its mapped replacement.

Gate 5 is the claim-safety gate. The CEO review session runs it. No agent
approves it.

### Gate 6 — Quality

Work: run the full quality pass.

Exit test:
- The 22 faults in the defect sheet are each marked fixed, moved, or dropped
  with a reason.
- Lighthouse on mobile: performance at or above 90, accessibility at 100.
- axe reports no violation on any route.
- The site works with JavaScript disabled for reading and navigation.
- The de-vibecode review passes. The page must not read as generated.
- Test on a real mid-range Android phone on a mobile network.

### Gate 7 — Packaging and freeze

Work: write the handover. Set the production domain. Set the redirects, the
sitemap, the robots file, and the Open Graph images.

Exit test:
- README.md explains how to run, build, and deploy the site.
- docs/CONTENT.md explains how a non-developer edits copy.
- A tagged release exists.
- After the tag, the site is frozen. A change needs a new branch and a new gate
  record.

## 9. Open decisions that block Gate 0

These come from the decision record. Each one blocks work if left open.

1. Route cut-over: all at once, or a gradual wind-down of legacy routes.
2. CMS: none for release one, or a headless CMS from the start.
3. Legacy story migration: edit the nine stories before launch, or ship as is.
4. Brand palette: confirm the v2 tokens sampled from the logo.
5. Contact details: the one true address, phone number, and email address.
6. Hosting: confirm Vercel, and confirm the backup arrangement.

Decision 5 has no default. The others have a recommended answer in this plan.

## 10. Risks

- Two agents edit one file and the merge destroys work. Control: section 7.
- Token drift produces a page that looks close but not right. Control: Gate 1.
- Unsourced claims about partners reach a sponsor. Control: Gate 5.
- The build is beautiful on a laptop and slow on a Kenyan phone. Control: the
  device test in Gate 6.
- Scope grows into a resource management system. That system is named in the
  remediation brief. It is out of scope for this plan.
