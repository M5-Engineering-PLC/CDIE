"use client";

// Section. Copy: HOME > What CDIE is. Lucid: Home, the three-word definition.
/*
  Change request 2026-09-21, section 2: "on mobile, what cdie is should also be
  a carousel".

  On a phone the list is a scroll-snapping row with direct pagination dots.
  From md it becomes the staggered three-up composition from the supplied image.
*/

import Image from "next/image";
import { useRef, useState } from "react";

import { useRailRotation } from "@/lib/useRailRotation";

export type TriadItem = {
  id: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

export function TriadRail({ items }: { items: readonly TriadItem[] }) {
  const rail = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  useRailRotation(rail, 11000);

  const updateActive = () => {
    const node = rail.current;
    if (!node) return;
    const children = [...node.children] as HTMLElement[];
    const closest = children.reduce((best, card, index) =>
      Math.abs(card.offsetLeft - node.scrollLeft) < Math.abs(children[best].offsetLeft - node.scrollLeft) ? index : best, 0);
    setActive(closest);
  };

  return (
    <div>
    <ul ref={rail} onScroll={updateActive} aria-label="What CDIE is" className="triad-rail rail rail-glide -mx-gutter auto-cols-[82%] gap-4 px-gutter md:mx-0 md:grid-flow-row md:auto-cols-auto md:grid-cols-3 md:overflow-visible md:px-0">
      {items.map((item, index) => (
        <li key={item.id} className="triad-card">
          <div className="triad-photo">
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 82vw, 33vw"
              className="object-cover"
            />
            <span className="triad-number">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="triad-copy flex flex-col gap-2">
            <h3 className="display text-sub text-brand">{item.title}</h3>
            <p className="text-body leading-relaxed text-ink-2">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
    <div className="triad-dots md:hidden" aria-label="What CDIE is slides">
      {items.map((item, index) => (
        <button key={item.id} type="button" aria-label={`Show ${item.title}`} aria-current={active === index ? "true" : undefined} onClick={() => rail.current?.children[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })} />
      ))}
    </div>
    </div>
  );
}
