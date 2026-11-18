# Branch rules

These rules apply to every repository in M5-Engineering-PLC. Adopted on 2026-10-20. Updated on 2026-10-30: added the `skill/` type and the table of types.

## Rules

- `main` is the only long-lived branch.
- Make one short-lived branch for each piece of work.
- Name the branch `type/short-topic`. Use one of the types in the table below. Write the topic in lowercase words joined by hyphens, for example `feat/case-snap-coupon`.
- Put every change into `main` through a pull request. Only nenemwaniki approves changes to `main`.
- GitHub deletes the branch automatically after the merge.
- Keep backups and archives as tags named `archive/<topic>`, not as branches.
- Keep large binary files in GitHub Releases, not in branches.
- If a branch has no commits for 14 days, open a pull request or delete the branch.

## Branch types

Choose the type from the main purpose of the work. If one branch does two kinds of work, use the type of the larger part, or make two branches.

| Type | Use it for | Do not use it for | Examples |
|---|---|---|---|
| `feat/` | New software or new content that adds a function: an app feature, a tool, a script, a presentation page, a plugin. | Agent skills (use `skill/`). Hardware design files (use `hw/`). | `feat/m5-orchestration`, `feat/tech-stack-page` |
| `fix/` | A correction to something that is already on `main`: a defect, a wrong value, broken content, a failing check. | New functions, even small ones (use `feat/`). | `fix/remove-personal-content`, `fix/led-hole-diameter` |
| `docs/` | Documents only: READMEs, rules, design proposals, reviews, records, research notes. No code or design file changes. | A skill proposal that goes with the skill files (use `skill/`). | `docs/branching-rules`, `docs/fabric-hygiene-proposals` |
| `hw/` | Hardware design files: schematics, PCB layouts, footprints, enclosures and CAD, fabric patterns, BOMs, manufacturing outputs. | Bench results and work orders (use `docs/` or `wo/`). | `hw/pcb-a-g6-routing`, `hw/fdm-case-snap` |
| `wo/` | The output of one work order, when the work order has an ID. Put the ID in the topic. | Work without a work order ID (use the type of the work). | `wo/wo-5b-fdm-case`, `wo/wo-11-simulation` |
| `skill/` | An agent skill or a change to one: a new skill folder, its SKILL.md, references, templates, engine or examples, and the design proposal for the skill. Use the skill folder name as the topic. | A plugin that packages skills (use `feat/`). | `skill/tech-breakdown`, `skill/circuit-design-stripboard` |

## Before you delete a branch

Make sure that `main`, a tag, or a release contains all the commits of the branch. Then delete it.
