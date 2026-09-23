"use client";

// The reader's reduced-motion setting, kept current if they change it mid-visit.

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (change: () => void) => {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
};

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
