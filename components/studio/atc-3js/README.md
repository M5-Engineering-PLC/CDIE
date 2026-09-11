# CDIE ATC Prototyping Workshop Three.js Package

Status: Illustrative compact workshop model based on site video captures and workshop schematic.

This directory is the self-contained React and Three.js package for the CDIE ATC (Appropriate Technology Centre) Engineering and Prototyping Workshop floor plan.

## Overview

- **Dimensions**: Compact 12.8m × 8.8m footprint with low cutaway perimeter walls.
- **Blue Shipping Container**: Positioned on the left side with concrete foundation curb, corrugation, and animated roll-up shutter.
- **Equipment & Storage inside Container**:
  - Blue Elephant ELECNC1212 3-axis CNC router on the right.
  - Dedicated CNC operator workstation desk on the left of the router.
  - 4-tier heavy-duty steel shelving along the container rear wall packed with Total turquoise and yellow tool cases, spray cans, and hardware bins.
- **Main Open Workshop**:
  - Blue Elephant CO2 laser cutter against the rear slatted window wall with canopy lid and ducted exhaust.
  - Twin fabrication workbenches in the center foreground with Total swivel bench vice clamping a steel tube, 200A inverter welder, angle grinder, and hand tools.
  - Double entrance access doors on the right wall.
- **Visual Style**: Studio presentation background (`#f1f5f9`), realistic terrazzo speckled concrete floor, and floating numbered station badges (1–4) matching the Design Studio reference.

## Invoke the packaged viewer

```tsx
"use client";

import { useState } from "react";
import { Atc3D, type AtcServiceId } from "@/components/studio/atc-3js";

export function AtcModelExample() {
  const [active, setActive] = useState<AtcServiceId | null>(null);

  return <Atc3D active={active} onSelect={setActive} />;
}
```

## Public Props

- `active`: highlighted station service id (`cnc-machining`, `tooling-storage`, `laser-cutting`, `manual-fabrication`, `facility-access`), or `null`.
- `onSelect`: callback when user clicks equipment in the 3D scene.
- `className`: optional CSS classes for the container.
- `initialView`: `isometric` or `top`.

## Lower-level invocation

`createAtcModel()` returns the reusable `THREE.Group`. The returned group exposes runtime handles via `group.userData.sculptRuntime`:
- `nodes`: dictionary of named 3D objects
- `services`: dictionary of grouped meshes per service
- `selectable`: raycast-enabled interactive meshes
- `sprites`: numbered station badge sprites (1–4)
- `toggleShutter()`: opens/closes the container roll-up shutter
- `setLabelsVisible(boolean)`: toggles 3D badge visibility
