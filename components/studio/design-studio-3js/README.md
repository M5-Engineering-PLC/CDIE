# Design Studio Three.js package

Status: illustrative and unmeasured room model.

This directory is the self-contained React and Three.js package for the CDIE
Design Studio model. It is deliberately not connected to the current page
composition. The page integration and final appearance remain open for review.

## Invoke the packaged viewer

Import the public component from the directory entry point:

```tsx
"use client";

import { useState } from "react";

import {
  DesignStudio3D,
  type ServiceId,
} from "@/components/studio/design-studio-3js";

export function StudioModelExample() {
  const [active, setActive] = useState<ServiceId | null>(null);

  return <DesignStudio3D active={active} onSelect={setActive} />;
}
```

The component creates and disposes its renderer, camera, controls, lights,
geometry and materials. It resizes with its container and provides Isometric
and Top view controls. Selecting model geometry emits its service id through
`onSelect`.

## Public props

- `active`: highlighted service id, or `null` for the full room.
- `onSelect`: called when a visitor selects mapped model geometry.
- `className`: optional classes for the outer viewer.
- `initialView`: `isometric` or `top`.

## Lower-level invocation

`createDesignStudioModel()` returns the reusable `THREE.Group` when the host
page needs to supply its own renderer and controls. The returned group exposes
named nodes, selectable meshes and service groups through
`group.userData.sculptRuntime`.

The package has no image or network dependency. Its only runtime dependency is
`three`; React is supplied by the CDIE application.
