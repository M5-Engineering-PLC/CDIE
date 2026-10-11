// Lucid: Design Studio virtual tour. Copy: DESIGN STUDIO > Virtual tour.
import { preloadAtc3D, preloadDesignStudio3D } from "./preloadStudio3D";

/* Fix plan 2026-10-11, W2: prefetch code only on 3D control hover or focus. No idle scene build. */
export function prefetchStudio3D() {
  void preloadDesignStudio3D().catch(() => {});
  void preloadAtc3D().catch(() => {});
}
