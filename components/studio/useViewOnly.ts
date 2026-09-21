"use client";

/*
  Change request 2026-09-21, section 4, mobile: "lets have only autofocus
  capabilities, no scrolling, implement a view only mechanism of the same
  interface as desktop".

  True where dragging the room would fight the page: a coarse pointer, or a
  viewport narrow enough that the canvas spans it and there is nowhere left to
  start a scroll. Read through useSyncExternalStore rather than an effect, so
  the first client render already has the right answer and the server render
  has a defined one.
*/

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse), (max-width: 1023px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** The server cannot know the pointer, and the desktop posture is the richer
    one: assuming it would hand a phone orbit controls for one frame. */
const onServer = () => true;

export function useViewOnly(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, onServer);
}
