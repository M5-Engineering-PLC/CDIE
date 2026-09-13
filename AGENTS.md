<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CDIE website — agent guide

This file is the instruction set for any agent working in this repository,
Codex and Claude alike. `CLAUDE.md` imports it, so there is one guide, not two.
Read `docs/BUILD_PLAN.md` before starting work; this file is the short form of
its rules.

## Source authority

The Lucid document CDIE Website Skeleton is the single source of truth for
structure. The Actual Copy tab of the CDIE website content document is the
single source of truth for words. Neither is overruled by a concept file, a
screenshot, or by this repository.

| Question | Ask |
|---|---|
| What pages exist, what sits under what | Lucid, page 1 Target IA |
| What is on the live site today, what is retired | Lucid, page 2 Current site |
| Which structural questions are still open | Lucid, page 3 Open forks |
| Every headline, button label, field label, FAQ | Actual Copy tab |
| Hero composition, studio explorer interface | The two selected renders |
| The studio room geometry | The Three.js prototype layout module |
| Page flows, section order, carousel and studio behaviour | `docs/reference/CDIE_Website_Flow_Review_2026-09-10.html` |
| Stack, contract, branches, gates | `docs/BUILD_PLAN.md` |

If two sources disagree, do not pick one quietly. Record the conflict in
`docs/BUILD_PLAN.md` section 3.2 and raise it.

## Claim safety

This is the rule that matters most on this project. An audit of the current
site found published facts that no source supports. The new site does not
repeat that.

- Never invent a date, a fee, an award amount, a specification, a person, a
  cohort, an alumni destination or a testimonial.
- A fact the source marks `[TBD]` does not reach a public field. Put it in the
  record's `pending` array; the page renders the enquiry wording instead.
- An action button exists only where its destination is live. Otherwise use the
  enquiry wording from the Actual Copy tab.
- Editorial notes and tone notes from the source document are guidance for the
  writer, never website copy.
- Never place a capability inside the studio model because there is room for
  it. Position comes from the layout module or from nothing.

## Code rules

- `app/` composes sections and declares no styles of its own.
- A section composes blocks and primitives, and takes content as props.
- No component imports from `content/` directly. Routes read data and pass it
  down.
- No hex value, font stack or spacing number outside `app/globals.css`. If you
  need a token, ask; do not add one.
- No component file over 150 lines. If it grows, split it.
- Nothing in `components/studio/` imports from `content/`. The viewer takes a
  capability id and emits a capability id. Copy and media live beside it.
- Every component names its source in a one-line comment at the top: the Lucid
  block for structure, the Actual Copy heading for words.
- Server components by default. `"use client"` only where there is state,
  an event handler or a browser API.
- Next.js 16: `params` and `searchParams` are promises and must be awaited.
  Use the generated `PageProps<'/route'>` helper.

## Plain-text file style

Files with a `.txt` or `.md` extension are read as plain text and are often
pasted into email and other people's documents.

- No asterisk emphasis. No bold, italic or underscore emphasis. Carry emphasis
  in the wording.
- Bullets use `-`.
- No decorative separators or punctuation used as ornament.
- Headings and tables in `.md` are real structure. Keep them.
- Backticks only where they mark an actual literal: a path, a command, an
  identifier.

This governs file contents only. It does not govern `.html`, `.tsx`, `.css` or
anything a renderer consumes.

## Branches

- One agent, one branch, one lane. `feat/<lane>-<component>`.
- No two open branches edit the same file.
- `app/globals.css` is owned by the review session only.
- One pull request per component group. `main` stays deployable.

## Checks before you hand work back

```bash
npm run lint
npm run typecheck
npm run build
```
