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
*/

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type ProgrammeHeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  action: { label: string; href: string };
};

const ROTATION_MS = 7000;
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
  const [paused, setPaused] = useState(false);
  const [chosen, setChosen] = useState(false);
  const down = useRef<number | null>(null);
  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || chosen || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => go(index + 1), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [chosen, go, index, paused]);

  const swipe = (end: number) => {
    const start = down.current;
    down.current = null;
    if (start === null || Math.abs(end - start) < SWIPE_PX) return;
    setChosen(true);
    go(index + (end < start ? 1 : -1));
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="CDIE programmes"
      className="relative min-h-[22rem] touch-pan-y overflow-hidden bg-ink text-surface md:min-h-[44rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={(event) => { down.current = event.clientX; }}
      onPointerUp={(event) => swipe(event.clientX)}
      onPointerCancel={() => { down.current = null; }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { setChosen(true); go(index + 1); }
        if (event.key === "ArrowLeft") { setChosen(true); go(index - 1); }
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
                <p className="trim-mobile mt-4 max-w-[54ch] text-body leading-relaxed text-surface/80 md:mt-6 md:text-lead">{slide.summary}</p>
                <Link href={slide.action.href} tabIndex={slideIndex === index ? 0 : -1} className="mt-5 inline-flex bg-brand-live px-5 py-3 font-medium text-surface transition hover:bg-brand md:mt-8 md:px-6 md:py-3.5">
                  {slide.action.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-surface/20 bg-ink/60 backdrop-blur-md">
        <div
          className="shell grid"
          style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}
        >
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              aria-current={slideIndex === index}
              onClick={() => { setChosen(true); setIndex(slideIndex); }}
              className={`relative flex min-w-0 items-center py-4 text-left text-fine transition-colors md:py-5 ${slideIndex === index ? "text-surface" : "text-surface/55 hover:text-surface"}`}
            >
              {slideIndex === index ? <span key={index} className={`hero-progress absolute inset-x-0 top-0 h-0.5 bg-brand-lift ${paused ? "paused" : ""}`} /> : null}
              <span
                aria-hidden="true"
                className={`mx-1 h-1.5 w-full rounded-full transition-colors sm:hidden ${slideIndex === index ? "bg-brand-lift" : "bg-surface/30"}`}
              />
              <span className="hidden truncate sm:block">{slide.eyebrow}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
