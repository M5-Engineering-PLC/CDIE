"use client";

// Beautify F05: the capability rail's constant drift, swipe and dot position.
/*
  2026-09-24: "make the cards a constant carousel with pause when hovering,
  swipe capability, and centered manual pagination dots". The rail holds the
  cards twice, so drifting past the first set wraps back without a jump. A
  swipe, a drag or a dot holds the drift for a moment and then it carries on;
  hovering or an open card holds it for as long as it lasts.

  Review 2026-09-30: "on all moving rails on mobile, ensure full cards is
  visible". Below md the rail steps one whole card per rotation and snaps, as a
  drift always shows parts of two. Above md it drifts, from a position kept
  here: scrollLeft is rounded to the pixel grid, and reading it back made the
  rail creep in uneven steps, the stutter the review asked about.
*/
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { glideBy } from "@/lib/motion";
import { ROTATE_MS } from "@/lib/useRailRotation";

const RESUME_MS = 4000;
const DRIFT_PX_PER_MS = 0.028;
const NARROW = "(max-width: 767px)";

const onNarrowChange = (change: () => void) => {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
};

function measure(node: HTMLElement | null, count: number) {
  const first = node?.firstElementChild as HTMLElement | null;
  const second = first?.nextElementSibling as HTMLElement | null;
  const clone = node?.children[count] as HTMLElement | undefined;
  if (!node || !first || !second || !clone) return null;
  return { step: second.offsetLeft - first.offsetLeft, loop: clone.offsetLeft - first.offsetLeft };
}

/* Kept outside the hook: it moves the rail, which the compiler will not let a hook body do. */
function glideToCard(node: HTMLElement | null, count: number, index: number) {
  const size = measure(node, count);
  if (!node || !size) return;
  if (node.scrollLeft >= size.loop) node.scrollLeft -= size.loop;
  glideBy(node, index * size.step - node.scrollLeft);
}

export function useLoopRail(rail: RefObject<HTMLUListElement | null>, count: number, paused: boolean) {
  const [active, setActive] = useState(0);
  const holdUntil = useRef(0);
  const hold = useCallback((ms = RESUME_MS) => { holdUntil.current = performance.now() + ms; }, []);

  const narrow = useSyncExternalStore(onNarrowChange, () => window.matchMedia(NARROW).matches, () => false);

  // The motion. Stops for reduced motion, off screen, in a hidden tab and while held.
  useEffect(() => {
    const node = rail.current;
    if (!node || paused || count < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => { node.dataset.visible = String(entry.isIntersecting); }, { threshold: 0.25 });
    observer.observe(node);
    const idle = () => !document.hidden && node.dataset.visible === "true" && performance.now() > holdUntil.current;

    if (narrow) {
      const timer = window.setInterval(() => {
        const size = measure(node, count);
        if (!size?.step || !idle()) return;
        glideToCard(node, count, Math.round(node.scrollLeft / size.step) + 1);
      }, ROTATE_MS);
      return () => { window.clearInterval(timer); observer.disconnect(); };
    }

    let frame = 0;
    let last = 0;
    let at = node.scrollLeft;
    const tick = (time: number) => {
      const size = measure(node, count);
      // A swipe, a dot or the wrap below moved the rail: carry on from there.
      if (Math.abs(node.scrollLeft - at) > 1) at = node.scrollLeft;
      if (last && size && idle()) {
        at += Math.min(time - last, 40) * DRIFT_PX_PER_MS;
        if (at >= size.loop) at -= size.loop;
        node.scrollLeft = at;
      }
      last = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [rail, count, paused, narrow]);

  // Wrap past the copies and keep the dots on the card nearest the start.
  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    const onScroll = () => {
      const size = measure(node, count);
      if (!size || !size.step) return;
      if (node.scrollLeft >= size.loop) node.scrollLeft -= size.loop;
      setActive(Math.round(node.scrollLeft / size.step) % count);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [rail, count]);

  // Swipe. Touch scrolls natively; a mouse drags, and a drag is not a click.
  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    let drag: { x: number; left: number; moved: boolean } | null = null;
    let pressed = false;
    const onDown = (event: PointerEvent) => {
      pressed = true;
      hold(Number.POSITIVE_INFINITY);
      if (event.pointerType === "mouse" && event.button === 0) drag = { x: event.clientX, left: node.scrollLeft, moved: false };
    };
    const onMove = (event: PointerEvent) => {
      if (!drag) return;
      const dx = event.clientX - drag.x;
      if (Math.abs(dx) > 5) drag.moved = true;
      if (drag.moved) node.scrollLeft = drag.left - dx;
    };
    const onUp = () => {
      if (!pressed) return;
      pressed = false;
      hold();
      if (!drag?.moved) { drag = null; return; }
      drag = null;
      const swallow = (click: MouseEvent) => { click.preventDefault(); click.stopPropagation(); };
      node.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => node.removeEventListener("click", swallow, { capture: true }), 0);
    };
    node.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      node.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [rail, hold]);

  const goTo = (index: number) => {
    hold();
    glideToCard(rail.current, count, index);
  };

  return { active, goTo };
}
