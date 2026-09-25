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
- `docs/SECRETS_CHECKLIST.md` — every credential the site can use, who owns it
  and where it is set. `docs/DASHBOARD_WALKTHROUGH.md` — the one-page guide to
  the admin dashboard for the CDIE team.

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

Sign-in on `/admin` is switched on with `ADMIN_AUTH=on` and `ADMIN_PASSWORD`.
Until both are set (the 2026-09-22 decision was no login for now) anyone who
knows the URL can open it on a deployed environment. Set both before the site
is public; see `docs/SECRETS_CHECKLIST.md`.

### Where dashboard content lives

The Google Sheet is the database. With `GOOGLE_SHEET_ID`,
`GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` set, every dashboard
save is written to the sheet, one tab per section (created on first use), and
the site reads from it. Share the sheet with the service account as an Editor.

The workflow `.github/workflows/sync-cms.yml` pulls the sheet into
`content/cms-snapshot.json` every hour, and straight away when the dashboard
fires its `cms-updated` event (set `GITHUB_REPO` and `GITHUB_TOKEN`). The site
falls back to that snapshot if the sheet cannot be reached. Subscriber emails
and enquiry counts stay in the sheet and never reach the snapshot. The
workflow needs the three Google values and `CMS_PUSH_TOKEN` as repository
secrets; until they are set it exits with a notice rather than failing.

`main` is protected by a ruleset (`scripts/protect-main.sh`) that repository
admins bypass, so `GITHUB_TOKEN` and `CMS_PUSH_TOKEN` must be an admin's
fine-grained token (this repository, Contents read and write).
`scripts/connect-services.sh` enters every value in Vercel and GitHub in one
run, from the service account's JSON key.

A dashboard post whose link is a LinkedIn post also shows in the LinkedIn band
on Media, so posts can be added by hand until the Make scenario is connected.

Without a sheet, the dashboard writes a local file under `.data`, which suits a
dev server only. Setup details are in `.env.example`.

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

## Continuous integration

`.github/workflows/ci.yml` runs lint, route type generation, typecheck, the tests and a
production build on every pull request and on `main`. It needs no secrets:
without them the build serves the stub LinkedIn feed and the committed content
snapshot, which is what a preview should do.

## Deployment

Vercel. Every pull request gets a preview deployment; `main` deploys to
production. A pull request merges after the preview renders, the checks pass and
the review session approves.
