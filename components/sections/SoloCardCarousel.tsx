"use client";

/*
  Change request 2026-09-21, section 2: "on our latest, show only one card at a
  go, then automove in 3 seconds if someone stays on that position".

  One card fills the frame. A card that has been on screen for DWELL_MS without
  the reader touching it gives way to the next; hovering, focusing, dragging or
  pressing a dot stops the rotation, because at that point the reader is driving
  and taking the card away would be rude rather than helpful.

  Decision R8 still holds: the rail carries cards that link onward, never the
  only copy of something a reader needs. Every destination here is also reachable
  from the navigation.

  Change request 2026-09-21, second pass: "apply smoother transitions for all
  carousels". The picture crossfaded while the words under it swapped in the
  same frame, which is the cut the first pass was trying to remove. The copy
  now rises in with .settle on the same token, and the dots ease rather than
  step.
*/

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { VisualRailItem } from "./VisualCardRail";

const DWELL_MS = 3000;
const SWIPE_PX = 48;

export function SoloCardCarousel({ items, label }: { items: VisualRailItem[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const down = useRef<number | null>(null);

  useEffect(() => {
    if (held || items.length < 2) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % items.length),
      DWELL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [held, index, items.length]);

  const swipe = (end: number) => {
    const start = down.current;
    down.current = null;
    if (start === null || Math.abs(end - start) < SWIPE_PX) return;
    setHeld(true);
    setIndex((current) => (current + (end < start ? 1 : items.length - 1)) % items.length);
  };

  if (items.length === 0) return null;
  const item = items[index];

  return (
    <div
      aria-roledescription="carousel"
      aria-label={label}
      className="mx-auto max-w-[46rem]"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onPointerDown={(event) => { down.current = event.clientX; }}
      onPointerUp={(event) => swipe(event.clientX)}
      onPointerCancel={() => { down.current = null; }}
    >
      <article className="card-hit overflow-hidden border border-line bg-surface">
        <div className="relative aspect-[16/10] overflow-hidden">
          {items.map((candidate, candidateIndex) => (
            <div
              key={candidate.id}
              aria-hidden={candidateIndex !== index}
              className={`scene absolute inset-0 ${candidateIndex === index ? "on" : ""}`}
            >
              <Image
                src={candidate.image}
                alt={candidate.alt}
                fill
                sizes="(max-width: 768px) 100vw, 46rem"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div key={item.id} className="settle flex flex-col gap-2 p-5 md:p-6">
          <p className="kicker">{item.eyebrow}</p>
          <h3 className="display text-sub">{item.title}</h3>
          <p className="trim-mobile text-body leading-relaxed text-ink-2">{item.summary}</p>
          <Link
            href={item.href}
            className="stretch pt-2 font-medium text-brand transition-colors hover:text-brand-live"
          >
            {item.action}
          </Link>
        </div>
      </article>

      <div className="mt-4 flex justify-center gap-2">
        {items.map((candidate, candidateIndex) => (
          <button
            key={candidate.id}
            type="button"
            aria-label={candidate.title}
            aria-current={candidateIndex === index}
            onClick={() => { setHeld(true); setIndex(candidateIndex); }}
            className={`h-1.5 w-10 rounded-full transition-colors duration-500 hover:bg-brand-lift ${
              candidateIndex === index ? "bg-brand" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
