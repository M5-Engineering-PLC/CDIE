// Lucid: Design Studio, virtual tour first. Load 3D code only on explicit intent.

type DesignStudioModule = typeof import("./design-studio-3js");
type AtcModule = typeof import("./atc-3js");

let studioLoad: Promise<DesignStudioModule> | undefined;
let atcLoad: Promise<AtcModule> | undefined;

/* Review 2026-10-19: modules that have finished loading, so the stage can mount a
   room directly instead of through a lazy boundary that shows its fallback first. */
export const loadedStudio3D: { studio?: DesignStudioModule; atc?: AtcModule } = {};

export function preloadDesignStudio3D() {
  studioLoad ??= import("./design-studio-3js").then((mod) => (loadedStudio3D.studio = mod), (error) => {
    studioLoad = undefined;
    throw error;
  });
  return studioLoad;
}

export function preloadAtc3D() {
  atcLoad ??= import("./atc-3js").then((mod) => (loadedStudio3D.atc = mod), (error) => {
    atcLoad = undefined;
    throw error;
  });
  return atcLoad;
}
