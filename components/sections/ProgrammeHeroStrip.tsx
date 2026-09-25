"use client";

// Review R1: the landing carousel's tab strip. Copy: HOME > Three ways in.
/*
  Daily note 2026-09-25: the slide in focus has its action here, in the strip,
  not on the slide. Its entry is the link; the others are buttons that bring
  their slide into focus. Split from ProgrammeHeroCarousel for the 150-line
  rule.
*/

import Link from "next/link";

import type { ProgrammeHeroSlide } from "./ProgrammeHeroCarousel";

export function ProgrammeHeroStrip({
  slides,
  index,
  inspecting,
  onSelect,
}: {
  slides: ProgrammeHeroSlide[];
  index: number;
  inspecting: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 border-t border-surface/20 bg-ink/60 backdrop-blur-md">
      <div
        className="shell grid"
        style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}
      >
        {slides.map((slide, slideIndex) => {
          const active = slideIndex === index;
          const progress = active ? (
            <span key={index} className="hero-progress absolute inset-x-0 top-0 h-0.5 bg-brand-lift" style={{ animationPlayState: inspecting ? "paused" : "running" }} />
          ) : null;
          const dot = (
            <span
              aria-hidden="true"
              className={`mx-1 h-1.5 w-full rounded-full transition-colors sm:hidden ${active ? "bg-brand-lift" : "bg-surface/30"}`}
            />
          );
          return active ? (
            <Link
              key={slide.id}
              href={slide.action.href}
              aria-current="true"
              className="relative flex min-w-0 items-center gap-2 py-4 text-left text-fine font-medium text-surface transition-colors hover:text-brand-lift md:py-5"
            >
              {progress}
              {dot}
              <span className="sr-only sm:not-sr-only sm:block sm:truncate">{slide.action.label}</span>
              <span aria-hidden="true" className="hidden shrink-0 sm:block">&rarr;</span>
            </Link>
          ) : (
            <button
              key={slide.id}
              type="button"
              onClick={() => onSelect(slideIndex)}
              className="relative flex min-w-0 items-center py-4 text-left text-fine text-surface/55 transition-colors hover:text-surface md:py-5"
            >
              {dot}
              <span className="hidden truncate sm:block">{slide.eyebrow}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
