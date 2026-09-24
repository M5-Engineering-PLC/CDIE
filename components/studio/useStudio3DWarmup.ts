// Lucid: Design Studio, virtual tour first. Warm scene code when the route is idle.

import { useEffect } from "react";

import { preloadAtc3D, preloadDesignStudio3D } from "./preloadStudio3D";

export function useStudio3DWarmup(includeAtc: boolean) {
  useEffect(() => {
    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const warm = () => {
      void preloadDesignStudio3D().catch(() => {});
      if (includeAtc) void preloadAtc3D().catch(() => {});
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(warm, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(warm, 300);
    }

    return () => {
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [includeAtc]);
}
