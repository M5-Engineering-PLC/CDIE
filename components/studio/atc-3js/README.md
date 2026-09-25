# CDIE ATC workshop model

Status: Illustrative room model based on the supplied ATC floor plan, four room videos, and four still images.

## Reference evidence

The hand-drawn plan places two metalworking benches on one side. It places two woodworking stations across the work aisle and a laser station near one end.

The room videos show green steel supports, high grid windows, a corrugated roof, blue storage bays, open tool shelves, and work tables. The prior ATC model also showed a blue shipping-container cutaway.

The video `IMG_0938.MP4` shows the Blue Elephant name and ELECNC1212 label on the woodworking router. The plan names a laser station but does not identify a laser make or model.

The plan has no room measurements. The model uses a 12.8 by 8.8 unit footprint as an on-screen estimate.

## Model details

- The room has an open cutaway side, a concrete floor, green steel framing, high windows, and optional corrugated roof panels.
- The retained blue shipping-container tool shed has the same illustrative position and dimensions as the prior model. It has an open side for the cutaway view.
- The floor plan shows two metalworking benches inside the container cutaway, a Blue Elephant router, a woodworking table, a laser station, and tool storage.
- The router has painted panels, steel rails, a spindle, dust hose, control screen, and brand label.
- The generic laser model carries no maker name because the supplied media does not identify its model.
- Concrete and wood use generated surface textures. Equipment uses separate painted metal, steel, glass, and rubber materials.
- The station markers start hidden. The room view controls can show the markers or roof panels.

## Use the viewer

```tsx
"use client";

import { useState } from "react";
import { Atc3D, type AtcServiceId } from "@/components/studio/atc-3js";

export function AtcModelExample() {
  const [active, setActive] = useState<AtcServiceId | null>(null);
  return <Atc3D active={active} onSelect={setActive} />;
}
```

## Viewer controls

- `active` highlights one workshop area.
- `onSelect` receives the area id when a visitor selects equipment.
- `className` adds classes to the viewer frame.
- `initialView` selects `isometric` or `top`.
- `tour` turns on the guided camera orbit.
- `interactive` enables pointer controls and selection.

`createAtcModel()` returns a Three.js group. The group stores the runtime handles in `userData.sculptRuntime`.

The runtime exposes the named objects, service groups, selectable meshes, station markers, and roof toggle. It also tracks generated textures for cleanup.
