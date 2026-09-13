"use client";

// Review R1: Home leads with the three programmes. Copy: HOME > Three ways in.

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

export function ProgrammeHeroCarousel({ slides }: { slides: ProgrammeHeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [chosen, setChosen] = useState(false);
  const go = useCallback((next: number) => setIndex((next + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || chosen || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => go(index + 1), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [chosen, go, index, paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="CDIE programmes"
      className="relative min-h-[36rem] overflow-hidden bg-ink text-surface md:min-h-[44rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { setChosen(true); go(index + 1); }
        if (event.key === "ArrowLeft") { setChosen(true); go(index - 1); }
      }}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.id}
          aria-hidden={slideIndex !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <Image src={slide.image} alt={slide.alt} fill priority={slideIndex === 0} sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/10" />
          <div className="absolute inset-x-0 bottom-24 top-0 flex items-center">
            <div className="shell">
              <div className="max-w-[42rem]">
                <p className="kicker !text-brand-lift">{slide.eyebrow}</p>
                <h1 className="display mt-5 text-head leading-none text-surface md:text-mega">{slide.title}</h1>
                <p className="mt-6 max-w-[54ch] text-lead leading-relaxed text-surface/80">{slide.summary}</p>
                <Link href={slide.action.href} tabIndex={slideIndex === index ? 0 : -1} className="mt-8 inline-flex bg-brand-live px-6 py-3.5 font-medium text-surface no-underline transition hover:bg-brand">
                  {slide.action.label}<span aria-hidden="true" className="ml-3">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-surface/20 bg-ink/60 backdrop-blur-md">
        <div className="shell grid grid-cols-3">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              aria-current={slideIndex === index}
              onClick={() => { setChosen(true); setIndex(slideIndex); }}
              className={`relative flex min-w-0 items-baseline gap-3 py-5 text-left text-fine transition ${slideIndex === index ? "text-surface" : "text-surface/55 hover:text-surface"}`}
            >
              {slideIndex === index ? <span key={index} className={`hero-progress absolute inset-x-0 top-0 h-0.5 bg-brand-lift ${paused ? "paused" : ""}`} /> : null}
              <span className="font-mono">0{slideIndex + 1}</span><span className="hidden truncate sm:block">{slide.eyebrow}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
