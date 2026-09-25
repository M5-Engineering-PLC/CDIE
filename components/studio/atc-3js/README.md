# CDIE ATC Prototyping Workshop Three.js Package

Status: Hyper-realistic compact workshop model based on site video captures, ground-truth photos, and workshop schematic.

This directory is the self-contained React and Three.js package for the CDIE ATC (Appropriate Technology Centre) Engineering and Prototyping Workshop floor plan.

## Overview

- **Dimensions**: Compact 12.8m × 8.8m footprint with clean low cutaway perimeter walls (no green overhead framing).
- **Blue Shipping Container**: Positioned on the left side with concrete foundation curb, corrugation, white louvered ventilation frame, and animated roll-up shutter (`toggleShutter`).
- **Equipment & Storage inside Container**:
  - Blue Elephant ELECNC1212 3-axis CNC router on tubular steel stand, yellow chassis, T-slot vacuum bed, gantry cable carrier, and extraction hose.
  - Dedicated CNC operator workstation desk beside the router with 3-drawer unit, widescreen LCD displaying NCStudio toolpath graphics, keyboard, mouse, and stool.
  - 4-tier heavy-duty steel shelving along the container rear wall packed with Total turquoise and yellow tool cases, WD-40 spray cans, hardware bins, and safety signs.
- **Main Open Workshop Floor**:
  - Blue Elephant CO2 laser cutter against the rear slatted window wall with tinted glass canopy, honeycomb bed, diamond logo, and exhaust duct.
  - Twin fabrication workbenches in the center foreground:
    - Workbench 1: TOTAL swivel bench vice clamping a steel square tube, yellow TOTAL MMA inverter arc welder with cooling fan grill, angle grinder, and stools.
    - Workbench 2: Parallel assembly bench with cordless drill, machinist square, caliper, and hardware tray.
    - Staging table: Plywood sheet and bar clamps.
  - Double entrance access gates on the right wall.
- **Visual Style**: Clean studio presentation background (`#f1f5f9`), procedural terrazzo speckled concrete floor, procedural hardwood grain, and numbered station badges (1–4).

## Public Props

- `active`: highlighted station service id (`metalworking`, `woodworking`, `laser-cutting`, `tooling-storage`, `facility-access`), or `null`.
- `onSelect`: callback when user clicks equipment in the 3D scene.
- `className`: optional CSS classes for the container.
- `initialView`: `isometric` or `top`.

## Runtime Handles

`createAtcModel()` returns the reusable `THREE.Group`. The returned group exposes runtime handles via `group.userData.sculptRuntime`:
- `nodes`: dictionary of named 3D objects
- `services`: dictionary of grouped meshes per service
- `selectable`: raycast-enabled interactive meshes
- `sprites`: numbered station badge sprites (1–4)
- `toggleShutter()`: opens/closes the container roll-up shutter
- `setLabelsVisible(boolean)`: toggles 3D badge visibility
