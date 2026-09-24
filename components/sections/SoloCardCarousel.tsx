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

  2026-09-24: "resize card to be smaller to fit full page". From tablet width
  the photograph and the words sit side by side, so the whole card, picture
  and copy together, fits on one screen.
*/

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import type { VisualRailItem } from "./VisualCardRail";

/* Enhancements 2026-09-22: rotate slowly. The duration itself is the
   .latest-progress animation in app/globals.css: the bar filling is what moves
   the carousel on, so the two can never disagree. */
const SWIPE_PX = 48;

export function SoloCardCarousel({ items, label }: { items: VisualRailItem[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [holding, setHolding] = useState(false);
  /* Reduced motion collapses every animation to an instant, which would make
     the bar race through the cards; with it on, the reader moves them. */
  const still = useReducedMotion();
  const down = useRef<number | null>(null);

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
      className="mx-auto max-w-[46rem] md:max-w-[58rem]"
      onPointerDown={(event) => { down.current = event.clientX; }}
      onPointerUp={(event) => swipe(event.clientX)}
      onPointerCancel={() => { down.current = null; }}
      onMouseEnter={() => setHolding(true)}
      onMouseLeave={() => setHolding(false)}
      onFocusCapture={() => setHolding(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHolding(false); }}
    >
      <article className="card-hit overflow-hidden border border-line bg-surface md:grid md:grid-cols-[1.15fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[19rem]">
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
                  sizes="(max-width: 768px) 100vw, 31rem"
                  className="object-cover"
                />
              ) : (
                <span className="block h-full w-full bg-raise" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
        <div key={item.id} className="settle flex flex-col justify-center gap-2 p-5 md:p-7">
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

      {/* Final pass 2026-09-23: "change it to a progress bar similar to the
          one at the hero". One segment per card: the ones already seen are
          full, the current one fills while it is on screen, and pressing a
          segment goes to that card. Hovering the card holds the bar. */}
      <div className="mt-5 flex items-center gap-2" role="group" aria-label={`${label} progress`}>
        {items.map((candidate, candidateIndex) => (
          <button
            key={candidate.id}
            type="button"
            aria-label={candidate.title}
            aria-current={candidateIndex === index}
            onClick={() => setIndex(candidateIndex)}
            className="group relative h-6 flex-1"
          >
            <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-line transition-colors group-hover:bg-brand-lift/40">
              {candidateIndex < index ? <span className="absolute inset-0 bg-brand" /> : null}
              {candidateIndex === index ? (
                <span
                  key={index}
                  className="latest-progress absolute inset-0 bg-brand"
                  style={{ animationPlayState: holding || still ? "paused" : "running" }}
                  onAnimationEnd={() => { if (!still) setIndex((index + 1) % items.length); }}
                />
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
