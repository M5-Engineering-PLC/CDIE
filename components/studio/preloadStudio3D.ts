// Lucid: Design Studio, virtual tour first. Load 3D code only on explicit intent.

type DesignStudioModule = typeof import("./design-studio-3js");
type AtcModule = typeof import("./atc-3js");

let studioLoad: Promise<DesignStudioModule> | undefined;
let atcLoad: Promise<AtcModule> | undefined;

export function preloadDesignStudio3D() {
  studioLoad ??= import("./design-studio-3js").catch((error) => {
    studioLoad = undefined;
    throw error;
  });
  return studioLoad;
}

export function preloadAtc3D() {
  atcLoad ??= import("./atc-3js").catch((error) => {
    atcLoad = undefined;
    throw error;
  });
  return atcLoad;
}
