# Reference documents

Governing inputs, filed here so the build does not depend on a path outside the
repository. These are read, not edited. If one needs to change, it changes at
its own source and is re-filed here.

| File | What it governs | Origin |
|---|---|---|
| `CDIE_Website_Flow_Review_2026-09-10.html` | Page flows, section order per page, carousel behaviour, the studio scene-state table, the Three.js integration boundary, and the build order | Codex session `01a08d1b-d5de-7623-aada-0b4204ab43a1`, updated 11 September 2026 |

## How the flow brief sits with the other sources

It is the architecture and behaviour brief. It does not overrule Lucid on
structure or the Actual Copy tab on words, and it says so itself: its status
line reads REVIEW, and it describes its own component boundaries and routes as
design proposals.

Where it is authoritative for this build:

- The order of sections within each of the six pages.
- Carousel rules: manual advance, named buttons, a position indicator, keyboard
  and touch support, disabled arrows at the ends rather than silent wrapping,
  and no nested links inside a clickable card.
- The Design Studio explorer: capability list, media stage, compact room
  navigator, inline detail, and one selected id driving all four.
- The studio scene states: poster and loading, overview, capability selected,
  media open, ATC selected, and error or unsupported.
- The accessible alternative: every hotspot has an equivalent labelled HTML
  button, every capability is reachable without the model, reduced motion
  selects without camera travel, and the page stays usable if 3D fails.
- Resource handling: mount one active room, stop off-screen animation, release
  geometry, materials and textures when retiring a scene.
- The build order, carried into `docs/BUILD_PLAN.md` as gates 4 to 8.

Where it is superseded:

- It predates the confirmation that Lucid is the single source of truth. Where
  its route table and the Lucid map differ, Lucid wins and the difference is
  recorded in `docs/BUILD_PLAN.md` section 3.2.
- Its own studio screenshot is an earlier capture. The prototype source is the
  current geometry.
- Its sample cards are content patterns, not content. Nothing in them is a
  claim that an issue, story or event exists.

## Other governing sources, held outside the repository

- Lucid, CDIE Website Skeleton, `ed616e50-dfd5-4179-8789-116fee3a1b1c`. Single
  source of truth for structure.
- Google Doc, CDIE website content, Actual Copy tab,
  `1dDpOhucEq4358mg5nLpFWAYdhhIaG5ZCYia8CRZ1zvw`. Single source of truth for
  words. Read only; the document is preserved.
- The two selected renders, cinematic arrival and room explorer, from Codex
  session `01a084da-b5c5-7af0-96e8-ca631b11a2f6`. Illustrative imagery, not
  CDIE photography.
- The Three.js studio prototype, Codex session
  `01a08a9e-a00c-7d50-bf0a-8c13823b6f36`. Its layout module is vendored into
  `components/studio/`; the room remains illustrative and unmeasured.
