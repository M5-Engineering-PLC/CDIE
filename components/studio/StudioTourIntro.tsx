"use client";

/*
  Selected concept 01: cinematic invitation before the practical room explorer.

  2026-09-11: the two images this panel used were screenshots of website
  concept mockups, not photographs. They carried an invented navigation bar,
  invented wall slogans and people who are not CDIE's, and the layout cropped
  and scaled one of them to hide its own chrome. Publishing a picture of a
  fictional CDIE on the real CDIE site is exactly the fabrication this project
  exists to avoid, so both are gone.

  The hero is now a CDIE photograph. The room-explorer preview thumbnail was a
  screenshot of an interface that does not exist; the real explorer is one
  button away, so it is replaced by a plain line saying what the tour contains.
*/

import Image from "next/image";

export function StudioTourIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="overflow-hidden bg-ink text-surface">
      <div className="grid min-h-[38rem] lg:grid-cols-[.9fr_1.1fr]">
        <div className="flex items-center px-gutter py-16 lg:pl-[max(var(--spacing-gutter),calc((100vw-76rem)/2+var(--spacing-gutter)))]">
          <div className="max-w-[36rem]">
            <p className="kicker !text-brand-lift">Design Studio / Virtual tour</p>
            <h1 className="display mt-5 text-head leading-none text-surface md:text-mega">
              Step inside CDIE.
            </h1>
            <p className="mt-6 max-w-[42ch] text-lead text-surface/80">
              Meet the spaces. Explore the tools. See where ideas take shape.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="mt-8 bg-brand-live px-6 py-3.5 text-body font-semibold text-surface transition hover:bg-brand"
            >
              Start the guided tour <span aria-hidden="true" className="ml-3">→</span>
            </button>
            <p className="mt-8 max-w-[38ch] border-t border-surface/20 pt-5 text-body text-surface/70">
              The tour opens a plan of the room. Choose a bench to see what that area
              supports, or pick a capability from the list.
            </p>
          </div>
        </div>
        <div className="relative min-h-[28rem] overflow-hidden">
          <Image
            src="/images/hero-workshop-1.jpg"
            alt="CDIE innovators marking and cutting a part together at a studio workbench"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 56vw"
            className="object-cover object-[60%_50%]"
          />
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ink to-transparent" />
        </div>
      </div>
    </section>
  );
}
