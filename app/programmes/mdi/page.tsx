// Lucid: Programmes > IvE > MDI, the flagship graduate track.
// Decision R3, 2026-09-11: cohorts live here, not on About Us. A cohort is
// evidence of the programme and reads as evidence beside the curriculum.
// Copy: PROGRAMMES > Medical Device Innovation.
// The three confirmed structure facts publish; intake, criteria, fees and the
// application form are unconfirmed and render as enquiries, never as claims.

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { Pending } from "@/components/primitives/Pending";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { StoryGrid } from "@/components/blocks/StoryGrid";
import { SampleNotice } from "@/components/blocks/SampleNotice";
import { mdi, mdiCohorts, mdiCohortsCopy } from "@/content/programmes";
import { SHOW_SAMPLE_CONTENT, sampleStories } from "@/content/samples";

export const metadata: Metadata = {
  title: "Medical Device Innovation",
  description: mdi.standfirst,
};

const crumbs = [
  { label: "Programmes", href: "/programmes" },
  { label: "Medical Device Innovation", href: "/programmes/mdi" },
];

export default function MdiPage() {
  return (
    <>
      <PageHero
        eyebrow="M.Sc. pathway"
        headline={mdi.headline}
        standfirst={mdi.standfirst}
        crumbs={crumbs}
      >
        <Button href="/contact?topic=admissions">Ask about the next intake</Button>
      </PageHero>

      <Section eyebrow="Programme structure" title="What the programme commits you to.">
        <dl className="grid gap-px bg-line md:grid-cols-2">
          {mdi.structure.map((row) => (
            <div key={row.label} className="bg-surface p-6">
              <dt className="kicker">{row.label}</dt>
              <dd className="mt-2 text-lead text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 max-w-[62ch]">
          <Pending items={mdi.structurePending} />
        </div>
        <div className="prose-body mt-10 max-w-[62ch] text-body leading-relaxed text-ink-2">
          {mdi.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section tone="surface" eyebrow="What you will learn" title="Five things you practise.">
        <ul className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
          {mdi.learn.map((item) => (
            <li key={item.title} className="flex flex-col gap-2 bg-raise p-6">
              <h3 className="display text-sub leading-snug">{item.title}</h3>
              <p className="text-body leading-relaxed text-ink-2">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="The curriculum in practice" title="Three stages.">
        <ol className="flex flex-col gap-px bg-line">
          {mdi.curriculum.map((stage, index) => (
            <li
              key={stage}
              className="grid gap-3 bg-surface p-6 md:grid-cols-[6rem_1fr] md:items-baseline"
            >
              <span className="font-mono text-fine text-brand-live">
                Stage {index + 1}
              </span>
              <p className="max-w-[64ch] text-body leading-relaxed text-ink-2">{stage}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="surface" eyebrow="Applying" title={mdi.who.headline}>
        <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">{mdi.who.body}</p>
        <div className="mt-6 max-w-[62ch]">
          <Pending items={mdi.who.pending} />
        </div>

        <h3 className="display mt-12 text-title">{mdi.applications.headline}</h3>
        <p className="mt-4 max-w-[62ch] text-body leading-relaxed text-ink-2">
          {mdi.applications.body}
        </p>
        <p className="mt-3 max-w-[62ch] text-body leading-relaxed text-ink-2">
          {mdi.applications.process}
        </p>
        <div className="mt-6 max-w-[62ch]">
          <Pending items={mdi.applications.pending} />
        </div>
        <div className="mt-6">
          <Button href={mdi.applications.action.href}>{mdi.applications.action.label}</Button>
        </div>
      </Section>

      <Section
        id="cohorts"
        eyebrow="Success stories"
        title={mdiCohortsCopy.headline}
        standfirst={mdiCohortsCopy.body}
      >
        {/*
          Change request 2026-09-13, section 6.2. mdiCohorts is empty by policy.
          Sample graduates render behind the flag so the card can be reviewed;
          their social links are deliberately absent, because a quote and a link
          about a real person need that person's written consent.
        */}
        {mdiCohorts.length === 0 && !SHOW_SAMPLE_CONTENT ? (
          <div className="border border-dashed border-line bg-surface p-8">
            <p className="max-w-[54ch] text-lead text-ink-2">{mdiCohortsCopy.empty}</p>
          </div>
        ) : (
          <>
            {mdiCohorts.length === 0 ? <SampleNotice what="graduate stories" /> : null}
            <StoryGrid items={sampleStories} />
          </>
        )}
      </Section>

      <Section tone="surface" eyebrow="Fees and funding" title={mdi.fees.headline}>
        <div className="max-w-[62ch]">
          <Pending items={mdi.fees.pending} />
        </div>
        <p className="mt-5 max-w-[62ch] text-body text-ink-2">{mdi.fees.guidance}</p>
        <p className="mt-3 max-w-[62ch] text-body text-ink-2">
          Ask the admissions team about scholarships, funding and any teaching or research
          role attached to the programme.
        </p>
      </Section>
    </>
  );
}
