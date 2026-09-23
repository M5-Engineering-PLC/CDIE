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

/* Enhancements 2026-09-22: rotate slowly and never pause. */
const DWELL_MS = 6000;
const SWIPE_PX = 48;

export function SoloCardCarousel({ items, label }: { items: VisualRailItem[]; label: string }) {
  const [index, setIndex] = useState(0);
  const down = useRef<number | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length < 2) return;
    /* changes-v2 item 3: hovering or focusing the card holds it. The tick keeps
       running and simply skips its turn, so the rotation resumes on leaving. */
    const timer = window.setInterval(() => {
      if (frame.current?.matches(":hover, :focus-within")) return;
      setIndex((current) => (current + 1) % items.length);
    }, DWELL_MS);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const swipe = (end: number) => {
    const start = down.current;
    down.current = null;
    if (start === null || Math.abs(end - start) < SWIPE_PX) return;
    setIndex((current) => (current + (end < start ? 1 : items.length - 1)) % items.length);
  };

  if (items.length === 0) return null;
  const item = items[index];

  return (
    <div
      aria-roledescription="carousel"
      aria-label={label}
      ref={frame}
      className="mx-auto max-w-[46rem]"
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
              {candidate.image ? (
                <Image
                  src={candidate.image}
                  alt={candidate.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 46rem"
                  className="object-cover"
                />
              ) : (
                <span className="block h-full w-full bg-raise" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
        <div key={item.id} className="settle flex flex-col gap-2 p-5 md:p-6">
          <p className="kicker">{item.eyebrow}</p>
          <h3 className="display text-sub">{item.title}</h3>
          <p className="text-body leading-relaxed text-ink-2">{item.summary}</p>
          <Link
            href={item.href}
            className="stretch pt-2 font-medium text-brand transition-colors hover:text-brand-live"
          >
            {item.action}
          </Link>
        </div>
      </article>

      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((candidate, candidateIndex) => (
          <button
            key={candidate.id}
            type="button"
            aria-label={candidate.title}
            aria-current={candidateIndex === index}
            onClick={() => setIndex(candidateIndex)}
            /* changes-v2 item 2: the active dot is larger and coloured. */
            className={`rounded-full transition-all duration-500 ${
              candidateIndex === index ? "h-3 w-3 bg-brand" : "h-2 w-2 bg-line hover:bg-brand-lift"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
