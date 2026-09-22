"use client";

/*
  Selected concept 01: cinematic invitation before the practical room explorer.

  2026-09-11: the two images this panel used were screenshots of website
  concept mockups, not photographs. They carried an invented navigation bar,
  invented wall slogans and people who are not CDIE's. Publishing a picture of
  a fictional CDIE on the real CDIE site is exactly the fabrication this
  project exists to avoid, so both are gone and the hero is a CDIE photograph.

  Change request 2026-09-21, section 4: "blend image as background on landing
  page, persistently on all devices, dont have it overflowing and landing on
  the bottom of the page."

  The photograph was the right-hand half of a two-column grid, so on a phone it
  fell below the words and the band ran on for two screens. It is now the
  background of the band itself, at every width: one layer, absolutely
  positioned, with the ink gradient over it so the type keeps its contrast.
  Nothing stacks beneath it, so there is nothing left to overflow.
*/

import Image from "next/image";

export function StudioTourIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-surface">
      <Image
        src="/images/service-3dprinting-2.jpeg"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/*
        Two washes rather than one. The vertical pass keeps the band readable
        on a phone, where the text sits over the middle of the frame; the
        horizontal pass does the same job on a wide screen, where the text is
        in the left third and the picture should still be visible on the right.
      */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/90 via-ink/70 to-ink/90" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/60 to-transparent" />

      <div className="shell band-y flex min-h-[20rem] items-center md:min-h-[32rem]">
        <div className="max-w-[36rem]">
          <p className="kicker !text-brand-lift">Design Studio / Virtual tour</p>
          <h1 className="display mt-3 text-head leading-none text-surface md:mt-5 md:text-mega">
            Step inside CDIE.
          </h1>
          <p className="mt-4 max-w-[42ch] text-body text-surface/85 md:mt-6 md:text-lead">
            Meet the spaces. Explore the tools. See where ideas take shape.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-6 bg-brand-live px-5 py-3 text-body font-semibold text-surface transition hover:bg-brand md:mt-8 md:px-6 md:py-3.5"
          >
            Start the guided tour
          </button>
          <p className="mt-6 hidden max-w-[38ch] border-t border-surface/20 pt-4 text-body text-surface/70 md:mt-8 md:block md:pt-5">
            The tour turns the room slowly and stops at each area in turn. Pick a
            capability from the list at any point to go straight to it.
          </p>
        </div>
      </div>
    </section>
  );
}
