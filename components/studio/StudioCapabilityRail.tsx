// Lucid: Design Studio capability directory. Copy: DESIGN STUDIO capability cards.
"use client";

import type { MouseEvent } from "react";
import { VisualCardRail, type VisualRailItem } from "../sections/VisualCardRail";
import { selectStudioService } from "./useStudioSelection";

/* Fix plan 2026-10-11, W2: Explore selects the room without a server navigation. */
export function StudioCapabilityRail({ items, label }: { items: VisualRailItem[]; label: string }) {
  const explore = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    const url = new URL(link.href, window.location.href);
    const service = url.searchParams.get("service");
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !items.some((item) => item.id === service)) return;
    event.preventDefault();
    selectStudioService(service!);
    document.getElementById("studio-room")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start",
    });
  };
  return <div onClickCapture={explore}><VisualCardRail items={items} label={label} /></div>;
}
