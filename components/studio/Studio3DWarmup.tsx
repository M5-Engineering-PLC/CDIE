// Lucid: Design Studio virtual tour. Starts the idle 3D warm-up from the site layout; renders nothing.
"use client";

import { useEffect } from "react";

import { warmStudio3D } from "./warmStudio3D";

/* Review 2026-10-19: three.js arrives only through warmStudio3D's dynamic imports, never in this bundle. */
export function Studio3DWarmup() {
  useEffect(() => {
    void warmStudio3D();
  }, []);
  return null;
}
