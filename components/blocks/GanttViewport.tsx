"use client";

// The scrolling frame of the Media events Gantt. Split from EventGantt so the
// chart itself stays a server component.
/*
  Enhancements 2026-09-22: "make it proportional to the screen being viewed,
  then make it scrollable but of course highlight the latest event". The frame
  is as tall as the screen allows and scrolls inside itself; on load it brings
  the latest event (marked data-latest) to the middle of the frame, moving only
  the frame, never the page.
*/

import { useEffect, useRef, type ReactNode } from "react";

export function GanttViewport({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = frame.current;
    const latest = node?.querySelector<HTMLElement>("[data-latest]");
    if (!node || !latest) return;
    node.scrollTop = latest.offsetTop - (node.clientHeight - latest.offsetHeight) / 2;
  }, []);

  return (
    <div
      ref={frame}
      tabIndex={0}
      aria-label="Events calendar, scrollable"
      className="relative max-h-[min(70svh,40rem)] overflow-y-auto overscroll-contain border border-line bg-surface [scrollbar-width:thin]"
    >
      {children}
    </div>
  );
}
