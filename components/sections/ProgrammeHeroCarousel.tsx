"use client";

// Review R1: Home leads with the three programmes. Copy: HOME > Three ways in.
/*
  Change request 2026-09-21, section 2. Four changes to the landing carousel:

  - The 01 / 02 / 03 counters are gone. They numbered the programmes, which
    implied an order none of the sources give them.
  - It answers a swipe and a drag, not only the tab strip and the arrow keys.
    On a phone the tab strip is a row of dots, because three labels will not
    fit across a handset without truncating all three.
  - Slides crossfade and settle rather than cutting, and the copy rises into
    place behind the image. The classes are .scene and .scene-copy in
    app/globals.css, so the timing is a token and not a number in here.
  - The band is half as tall on a phone, per section 1.

  Daily note 2026-09-25: the action button leaves the slide. Pressing a
  programme on the strip and then reaching up for "Discover" was two taps for
  one intent, so the strip entry for the slide in focus is now the link itself,
  carrying that slide's action label. The other entries stay buttons that bring
  their slide into focus.
*/

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProgrammeHeroStrip } from "./ProgrammeHeroStrip";

export type ProgrammeHeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  action: { label: string; href: string };
};

/* Enhancements 2026-09-22: rotate slowly and never pause. Choosing a slide
   moves to it and the rotation carries on from there. */
const ROTATION_MS = 12000;
/** A drag shorter than this is a tap or a scroll, not a swipe. */
const SWIPE_PX = 48;

export function ProgrammeHeroCarousel({
  slides,
  headingLevel = "h1",
}: {
  slides: ProgrammeHeroSlide[];
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  const [index, setIndex] = useState(0);
  const [inspecting, setInspecting] = useState(false);
  const down = useRef<number | null>(null);
  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (inspecting || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => go(index + 1), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [go, index, inspecting]);

  const swipe = (end: number) => {
    const start = down.current;
    down.current = null;
    if (start === null || Math.abs(end - start) < SWIPE_PX) return;
    go(index + (end < start ? 1 : -1));
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="CDIE programmes"
      className="relative min-h-[22rem] touch-pan-y overflow-hidden bg-ink text-surface md:min-h-[44rem]"
      onMouseEnter={() => setInspecting(true)}
      onMouseLeave={() => setInspecting(false)}
      onFocusCapture={() => setInspecting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInspecting(false); }}
      onPointerDown={(event) => { down.current = event.clientX; }}
      onPointerUp={(event) => swipe(event.clientX)}
      onPointerCancel={() => { down.current = null; }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { go(index + 1); }
        if (event.key === "ArrowLeft") { go(index - 1); }
      }}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.id}
          aria-hidden={slideIndex !== index}
          className={`scene absolute inset-0 ${slideIndex === index ? "on" : "pointer-events-none"}`}
        >
          <Image src={slide.image} alt={slide.alt} fill priority={slideIndex === 0} sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/10" />
          <div className="absolute inset-x-0 bottom-14 top-0 flex items-center md:bottom-24">
            <div className="shell">
              <div className="scene-copy max-w-[42rem]">
                <p className="kicker !text-brand-lift">{slide.eyebrow}</p>
                <Heading className="display mt-3 text-title leading-none text-surface md:mt-5 md:text-mega">{slide.title}</Heading>
                <p className="mt-4 max-w-[54ch] text-body leading-relaxed text-surface/80 md:mt-6 md:text-lead">{slide.summary}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <ProgrammeHeroStrip slides={slides} index={index} inspecting={inspecting} onSelect={setIndex} />
    </section>
  );
}
