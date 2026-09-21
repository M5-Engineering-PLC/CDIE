// Lucid: About Us > Explainer, Profiles Team. Copy: ABOUT US.
/*
  Change request 2026-09-21, section 1: a phone shows half the band. Two lists
  did most of the length here — the three purposes and eight portraits, each a
  full-width card in a single column. Both scroll-snap sideways below the
  breakpoint and are the grids they were above it. Nothing is removed: the
  supporting paragraphs fold to three lines with .trim-mobile and open again on
  a wider screen.
*/
// Profiles expand within this page. No person child routes.
/*
  Change request 2026-09-21, second pass, About Us:
  - "Add a hero image for the first section". The hero takes the two-column
    form PageHero already supports. The photograph is a genuine CDIE image
    from public/images and its alt text describes only what is in the frame.
  - "remove cohort section". The signpost band pointing at the MDI page goes
    with it. Decision R3 of 2026-09-11 still holds: cohorts live on the MDI
    page, where a cohort reads as evidence of the programme. What is withdrawn
    here is the pointer, not the cohorts themselves, and /about#cohorts now
    lands at the top of About Us rather than at a band of its own.
*/

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import {
  aboutIntro,
  collaborate,
  people,
  peopleCopy,
  purpose,
  workYouCanSee,
} from "@/content/about";

export const metadata: Metadata = {
  title: "About Us",
  description: aboutIntro.standfirst,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        headline={aboutIntro.headline}
        standfirst={aboutIntro.standfirst}
        image={aboutIntro.image}
      />

      <Section eyebrow="Why we are here" title={purpose.headline}>
        <p className="trim-mobile max-w-[62ch] text-lead leading-relaxed text-ink-2">{purpose.body}</p>
        <ul className="rail -mx-gutter mt-6 auto-cols-[80%] gap-4 px-gutter md:mx-0 md:mt-10 md:grid-flow-row md:auto-cols-auto md:grid-cols-3 md:gap-px md:overflow-visible md:bg-line md:px-0">
          {purpose.triad.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 border border-line bg-surface p-5 md:border-0 md:p-6">
              <h3 className="display text-sub text-brand">{item.title}</h3>
              <p className="text-body leading-relaxed text-ink-2">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="people"
        tone="surface"
        eyebrow="Our team"
        title={peopleCopy.headline}
        standfirst={peopleCopy.standfirst}
      >
        {people.length === 0 ? (
          <div className="border border-dashed border-line bg-raise p-8">
            <p className="max-w-[54ch] text-lead text-ink-2">{peopleCopy.empty}</p>
            <p className="mt-3 max-w-[62ch] text-body text-ink-3">
              A profile is published with a real photograph, a verified name and a current
              role, or it is not published. No placeholder people appear here.
            </p>
          </div>
        ) : (
          /*
            Change request 2026-09-13, section 6.1. Was a single hairline grid,
            which read as one block of faces. Each person is now a discrete
            card, so a name belongs visibly to a portrait. Lucid: a profile
            needs picture, name and designation, nothing else - so nothing else
            is added here.
          */
          <ul className="rail -mx-gutter auto-cols-[62%] gap-4 px-gutter sm:mx-0 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {people.map((person) => (
              <li
                key={person.id}
                className="flex flex-col overflow-hidden border border-line bg-surface transition-colors hover:border-brand-lift"
              >
                {person.portrait ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={person.portrait.src}
                    alt={person.portrait.alt}
                    width={person.portrait.width}
                    height={person.portrait.height}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[5/6] w-full bg-raise object-cover"
                  />
                ) : (
                  <div className="aspect-[5/6] w-full bg-raise" />
                )}
                <div className="flex flex-col gap-1 border-t border-line p-5">
                  <p className="display text-sub leading-snug text-ink">{person.name}</p>
                  <p className="text-body text-ink-2">{person.role}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* The cohorts band sat between Our team and this one. With it gone the
          two bands would have shared a ground and read as one, so the tones
          step from here down. */}
      <Section eyebrow="Work you can see" title={workYouCanSee.headline}>
        <p className="trim-mobile max-w-[58ch] text-lead leading-relaxed text-ink-2">
          {workYouCanSee.body}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {workYouCanSee.actions.map((action, index) => (
            <Button
              key={action.href}
              href={action.href}
              tone={index === 0 ? "solid" : "outline"}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Section>

      <Section tone="surface" eyebrow="Work with us" title={collaborate.headline}>
        <div className="prose-body trim-mobile max-w-[62ch] text-lead leading-relaxed text-ink-2">
          {collaborate.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-6">
          <Button href={collaborate.action.href}>{collaborate.action.label}</Button>
        </div>
      </Section>
    </>
  );
}
