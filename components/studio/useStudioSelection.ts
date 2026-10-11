// Lucid: Design Studio capability selections. Copy: DESIGN STUDIO capability names.
"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ExplorerCapability } from "./explorerModel";

export const SERVICE_CHANGE = "studio-service-change";

/* Fix plan 2026-10-11, W2: URL selections stay on the client, including card clicks and Back. */
export function selectStudioService(id: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("service", id);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(SERVICE_CHANGE));
}

function subscribe(notify: () => void) {
  window.addEventListener(SERVICE_CHANGE, notify);
  window.addEventListener("popstate", notify);
  return () => {
    window.removeEventListener(SERVICE_CHANGE, notify);
    window.removeEventListener("popstate", notify);
  };
}

export function useStudioSelection(capabilities: ExplorerCapability[], initialId: string) {
  const snapshot = useCallback(() => {
    const requested = new URL(window.location.href).searchParams.get("service");
    return capabilities.some((item) => item.id === requested) ? requested! : initialId;
  }, [capabilities, initialId]);
  const selectedId = useSyncExternalStore(subscribe, snapshot, () => initialId);
  return [selectedId, selectStudioService] as const;
}
