"use client";

/*
  A carousel of cards rather than of full slides.

  Decision R8, 2026-09-11: "the carousels are cards with a small descriptive
  info and linking button". That resolves the contradiction between the two
  review documents. The blueprint forbids putting essential information behind
  a carousel; Mololu asked for carousels. Both hold here, because every card is
  visible at once from a wide screen and each one only links onward: nothing
  lives inside the rail that a reader cannot reach without touching a control.

  On a narrow screen the rail scrolls and snaps, which is the mobile-first
  behaviour the blueprint asks for, and it is a plain scroll container, so it
  works with no JavaScript at all. The buttons are a convenience on top.

  Change request 2026-09-21, second pass: "apply smoother transitions for all
  carousels". The buttons glide the rail on the site's own duration and easing
  through lib/motion.ts instead of the browser's smooth-scroll curve, which is
  shorter and differs between engines.
*/

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { glideBy } from "@/lib/motion";
import { useRailRotation } from "@/lib/useRailRotation";

export type CardRailProps = {
  label: string;
  children: ReactNode;
  /** how many cards fit on a wide screen */
  columns?: 3 | 4;
};

export function CardRail({ label, children, columns = 3 }: CardRailProps) {
  const rail = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  useRailRotation(rail);

  const measure = useCallback(() => {
    const node = rail.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setAtStart(node.scrollLeft <= 2);
    setAtEnd(max <= 2 || node.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    measure();
    const node = rail.current;
    if (!node) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);

  const nudge = (direction: -1 | 1) => {
    const node = rail.current;
    if (!node) return;
    const step = node.clientWidth / (columns === 4 ? 3 : 2);
    glideBy(node, direction * step);
  };

  const track = columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <div className="flex flex-col gap-5">
      <ul
        ref={rail}
        onScroll={measure}
        aria-label={label}
        className={`rail-glide grid auto-cols-[minmax(17rem,85%)] grid-flow-col gap-5 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin] sm:auto-cols-[minmax(20rem,46%)] lg:auto-cols-auto lg:grid-flow-row lg:overflow-visible ${track}`}
      >
        {children}
      </ul>

      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => nudge(-1)}
          disabled={atStart}
          className="rounded-edge border border-line bg-surface px-3 py-1.5 text-body transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span aria-hidden="true">←</span>
          <span className="sr-only">Scroll {label} back</span>
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          disabled={atEnd}
          className="rounded-edge border border-line bg-surface px-3 py-1.5 text-body transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span aria-hidden="true">→</span>
          <span className="sr-only">Scroll {label} forward</span>
        </button>
      </div>
    </div>
  );
}
