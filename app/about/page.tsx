// Lucid: About Us > Explainer, Profiles Team. Copy: ABOUT US.
// Profiles expand within this page. No person child routes.
// Decision R3, 2026-09-11: cohorts moved to the MDI page, where they read as
// programme evidence. This page stays institutional. The #cohorts anchor is
// kept as a signpost so existing links still land somewhere useful.

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import {
  aboutIntro,
  cohortsPointer,
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
      />

      <Section eyebrow="Why we are here" title={purpose.headline}>
        <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">{purpose.body}</p>
        <ul className="mt-10 grid gap-px bg-line md:grid-cols-3">
          {purpose.triad.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 bg-surface p-6">
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
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      <Section id="cohorts" eyebrow="Cohorts" title={cohortsPointer.headline}>
        <p className="max-w-[58ch] text-lead leading-relaxed text-ink-2">
          {cohortsPointer.body}
        </p>
        <div className="mt-6">
          <Button href={cohortsPointer.action.href}>{cohortsPointer.action.label}</Button>
        </div>
      </Section>

      <Section tone="surface" eyebrow="Work you can see" title={workYouCanSee.headline}>
        <p className="max-w-[58ch] text-lead leading-relaxed text-ink-2">
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

      <Section eyebrow="Work with us" title={collaborate.headline}>
        <div className="prose-body max-w-[62ch] text-lead leading-relaxed text-ink-2">
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
