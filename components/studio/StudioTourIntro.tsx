"use client";

// Selected concept 01: cinematic invitation before the practical room explorer.

import Image from "next/image";

export function StudioTourIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="overflow-hidden bg-ink text-surface">
      <div className="grid min-h-[38rem] lg:grid-cols-[.9fr_1.1fr]">
        <div className="flex items-center px-gutter py-16 lg:pl-[max(var(--spacing-gutter),calc((100vw-76rem)/2+var(--spacing-gutter)))]">
          <div className="max-w-[36rem]">
            <p className="kicker !text-brand-lift">Design Studio / Virtual tour</p>
            <h1 className="display mt-5 text-head leading-none text-surface md:text-mega">Step inside CDIE.</h1>
            <p className="mt-6 max-w-[42ch] text-lead text-surface/80">Meet the spaces. Explore the tools. See where ideas take shape.</p>
            <button type="button" onClick={onStart} className="mt-8 bg-brand-live px-6 py-3.5 text-body font-semibold text-surface transition hover:bg-brand">
              Start the guided tour <span aria-hidden="true" className="ml-3">→</span>
            </button>
            <div className="mt-10 w-64 border border-surface/30 bg-surface/5 p-2">
              <div className="relative aspect-video overflow-hidden">
                <Image src="/images/tour-room-explorer.png" alt="Preview of the illustrative CDIE room explorer interface" fill sizes="16rem" className="object-cover" />
              </div>
              <p className="mt-2 font-mono text-fine text-surface/65">Room explorer preview</p>
            </div>
          </div>
        </div>
        <div className="relative min-h-[28rem] overflow-hidden">
          <Image src="/images/tour-start-guided.png" alt="Illustrative concept for a guided visit through the CDIE Design Studio" fill priority sizes="(max-width: 1024px) 100vw, 56vw" className="scale-125 object-cover object-[76%_60%]" />
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ink to-transparent" />
          <p className="absolute bottom-4 right-5 bg-ink/70 px-3 py-1.5 font-mono text-fine text-surface/70">Illustrative concept image</p>
        </div>
      </div>
    </section>
  );
}
