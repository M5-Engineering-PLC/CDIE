# CDIE website

The public website for the Centre for Design, Innovation & Engineering at
Kenyatta University.

Next.js 16 with the App Router, TypeScript in strict mode, Tailwind CSS v4, and
a Three.js room model on the Design Studio route. Content lives in typed
modules; there is no CMS in the first release.

## Run it

```bash
npm install
npm run dev
```

The site serves at `http://localhost:3000`.

## Checks

Run all three before opening a pull request. `main` stays deployable.

```bash
npm run lint
npm run typecheck
npm run build
```

## Read before you write code

- `AGENTS.md` — the working rules: source authority, claim safety, code rules,
  plain-text style, branches. `CLAUDE.md` imports it, so there is one guide for
  people and for agents.
- `docs/BUILD_PLAN.md` — the architecture, the component contract, the gates and
  the open decisions.
- `docs/reference/` and `docs/architecture/` — the governing inputs, filed so the
  build does not depend on a path outside the repository.

## Where things live

```text
app/                routes and page composition only, no styles of their own
  api/              route handlers
  admin/            internal tooling, not part of the viewer site
components/
  primitives/       Button, Kicker, Chip, Pending
  blocks/           Card and the card grid
  sections/         page sections, including the carousels
  chrome/           SiteNav, SiteFooter, SkipLink
  studio/           the room model and its viewer; imports nothing from content/
  admin/            components for the admin area only
content/            typed content modules, one per collection
docs/               the build plan, the gate records, the governing references
```

`app/globals.css` holds every colour, font and spacing token. Nothing else
declares one. It is owned by the review session: if you need a new token, ask.

## The admin area

`/admin` is internal tooling served by the same application. It is not part of
the viewer site: it is not in the Lucid IA, it renders no copy from the Actual
Copy tab, and no nav, footer or page on the viewer side links to it. It is
reached by typing the URL, and it is marked `noindex`.

Its first page is the model lab, at `/admin/models/design-studio` and
`/admin/models/atc`. Each mounts one Three.js package on its own, with the
station highlights, the tour and interactive flags, the room dimensions and a
log of the service ids the viewer emits. It exists so the models can be worked
on without driving the studio explorer around them.

There is no authentication on `/admin`. Anyone who knows the URL can open it on
a deployed environment, so nothing behind it may be private, and it stays
free of anything that writes or reveals data until an access decision is made.

## The two rules that matter most

**Lucid is the source of truth for structure, the Actual Copy tab for words.**
Neither is overruled by a concept file, a screenshot, or by this repository. If
two sources disagree, record it in `docs/BUILD_PLAN.md` section 3.2 and raise
it. Do not pick one quietly.

**Never invent a fact.** No date, fee, award amount, specification, person,
cohort or outcome that a source has not confirmed. A fact marked `[TBD]` goes in
a record's `pending` array and renders through the `Pending` component as an
honest gap pointing at an enquiry. An action button exists only where its
destination is live.

This is not abstract. An audit of the current site found published facts that
no source supports, including profiles that were never real people. The record
of those findings is kept outside this repository; the rules they produced are
the ones above.

## Deployment

Vercel. Every pull request gets a preview deployment; `main` deploys to
production. A pull request merges after the preview renders, the checks pass and
the review session approves.
