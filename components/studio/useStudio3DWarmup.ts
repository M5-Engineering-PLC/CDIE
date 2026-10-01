// Lucid: Design Studio, virtual tour first. Warm scene code when the route is idle, then the scenes.
// Review 2026-09-30: "preload the 3D views". Both rooms' code is fetched at the
// first idle moment, not only the room of the selected capability, so the 3D
// view and the switch to the ATC open without a loading wait.
// Revised 2026-10-01: the hook also reports idle, so the stage can build both
// scenes out of sight and a switch only shows a canvas.

import { useEffect, useState } from "react";

import { preloadAtc3D, preloadDesignStudio3D } from "./preloadStudio3D";

/** True once the browser is idle: the stage may then build both scenes out of sight. */
export function useStudio3DWarmup() {
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const warm = () => {
      void preloadDesignStudio3D().catch(() => {});
      void preloadAtc3D().catch(() => {});
      setWarm(true);
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(warm, { timeout: 800 });
    } else {
      timeoutId = window.setTimeout(warm, 300);
    }

    return () => {
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);
  return warm;
}
