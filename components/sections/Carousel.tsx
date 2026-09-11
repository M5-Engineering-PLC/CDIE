"use client";

/*
  Carousel rules come from the flow brief:
  manual advance only, named buttons, a visible position indicator, keyboard and
  touch support, and a disabled arrow at each end rather than silent wrapping.
  One item renders as a static card. No item auto-advances, and nothing here
  nests a link inside another link.
*/

import { useId, useRef, useState, type ReactNode } from "react";

export type CarouselProps = {
  label: string;
  slides: ReactNode[];
  slideLabels: string[];
};

export function Carousel({ label, slides, slideLabels }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const regionId = useId();

  if (slides.length === 0) return null;
  if (slides.length === 1) {
    return <div aria-label={label}>{slides[0]}</div>;
  }

  const atStart = index === 0;
  const atEnd = index === slides.length - 1;
  const go = (next: number) => setIndex(Math.min(Math.max(next, 0), slides.length - 1));

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="flex flex-col gap-5"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(index - 1);
        if (event.key === "ArrowRight") go(index + 1);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 48) go(delta < 0 ? index + 1 : index - 1);
        touchStart.current = null;
      }}
    >
      <div id={regionId} aria-live="polite">
        {slides.map((slide, position) => (
          <div
            key={slideLabels[position] ?? position}
            hidden={position !== index}
            aria-roledescription="slide"
            aria-label={`${position + 1} of ${slides.length}: ${slideLabels[position] ?? ""}`}
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <ol className="flex flex-wrap items-center gap-2">
          {slideLabels.map((slideLabel, position) => (
            <li key={slideLabel}>
              <button
                type="button"
                onClick={() => go(position)}
                aria-current={position === index ? "true" : undefined}
                className={`rounded-edge border px-2.5 py-1 font-mono text-[0.6875rem] transition-colors ${
                  position === index
                    ? "border-brand bg-brand text-surface"
                    : "border-line bg-surface text-ink-2 hover:border-ink-3"
                }`}
              >
                {slideLabel}
              </button>
            </li>
          ))}
        </ol>

        <div className="flex items-center gap-3">
          <p className="font-mono text-fine tabular-nums text-ink-3">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </p>
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={atStart}
            aria-controls={regionId}
            className="rounded-edge border border-line px-3 py-1.5 text-body disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span aria-hidden="true">←</span>
            <span className="sr-only">Previous {label}</span>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={atEnd}
            aria-controls={regionId}
            className="rounded-edge border border-line px-3 py-1.5 text-body disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span aria-hidden="true">→</span>
            <span className="sr-only">Next {label}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
