"use client";

/*
  Enhancements 2026-09-22: "for any carousel, ensure its rotating slowly to show
  everyone involved" and "remove any form of pause and play".

  A scrolling rail advances by one card on a slow interval and returns to the
  start after the last one, so every card comes into view without anyone
  touching a control. There is no pause: hovering, focusing or swiping does not
  stop it. A rail that fits its container (every card already visible, as on a
  wide screen) has nothing to rotate and stays still.
*/

import { useEffect, type RefObject } from "react";

import { glideBy } from "./motion";

export const ROTATE_MS = 6000;

export function useRailRotation(rail: RefObject<HTMLElement | null>, every = ROTATE_MS) {
  useEffect(() => {
    const timer = window.setInterval(() => {
      const node = rail.current;
      if (!node) return;
      if (node.matches(":hover, :focus-within")) return;
      const limit = node.scrollWidth - node.clientWidth;
      if (limit <= 2) return;
      if (node.scrollLeft >= limit - 2) {
        glideBy(node, -node.scrollLeft);
        return;
      }
      const card = node.firstElementChild as HTMLElement | null;
      const next = card?.nextElementSibling as HTMLElement | null;
      const step = card && next ? next.offsetLeft - card.offsetLeft : node.clientWidth;
      glideBy(node, step);
    }, every);
    return () => window.clearInterval(timer);
  }, [rail, every]);
}
