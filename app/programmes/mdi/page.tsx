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
import { mdiSemesters } from "@/content/curriculum";
import { CohortGrid } from "@/components/blocks/CohortGrid";
import { mdi, mdiCohortsCopy } from "@/content/programmes";
import { listItems } from "@/lib/admin/store";

export const metadata: Metadata = {
  title: "Medical Device Innovation",
  description: mdi.standfirst,
};

const crumbs = [
  { label: "Programmes", href: "/programmes" },
  { label: "Medical Device Innovation", href: "/programmes/mdi" },
];

export default async function MdiPage() {
  const cohorts = (await listItems("cohorts"))
    .filter((item) => item.image)
    .map((item) => ({ id: item.id, name: item.name, programme: item.programme, year: item.year, summary: item.summary, image: item.image }));

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

      {/*
        Change request 2026-09-13, section 4.5. Was three summarising sentences;
        the published outline lists every unit with its code. Rendered as an
        accordion per semester so the full curriculum is available without
        turning the page into a wall of course descriptions.
      */}
      <Section eyebrow="Course outline" title="Three semesters, full-time.">
        <div className="flex flex-col gap-px bg-line">
          {mdiSemesters.map((semester, index) => (
            <details
              key={semester.id}
              open={index === 0}
              className="group bg-raise open:bg-surface"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 p-6 transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
                <span className="display text-sub">{semester.name}</span>
                <span className="font-mono text-fine text-ink-3">
                  {semester.courses.length} units
                </span>
              </summary>
              <ol className="flex flex-col gap-px bg-line">
                {semester.courses.map((course) => (
                  <li
                    key={course.code ?? course.title}
                    className="grid gap-2 bg-surface p-6 md:grid-cols-[8rem_1fr] md:gap-6"
                  >
                    <span className="font-mono text-fine text-brand-live">
                      {course.code ?? "Elective"}
                    </span>
                    <div>
                      <h3 className="text-lead text-ink">{course.title}</h3>
                      <p className="mt-2 max-w-[64ch] text-body leading-relaxed text-ink-2">
                        {course.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </Section>

      <Section tone="surface" eyebrow="Applying" title={mdi.who.headline}>
        <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">{mdi.who.body}</p>
        <ul className="mt-6 flex max-w-[70ch] flex-col gap-3">
          {mdi.who.criteria.map((item) => (
            <li key={item} className="border-l-2 border-brand-lift pl-4 text-body leading-relaxed text-ink-2">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[70ch] text-body leading-relaxed text-ink-2">
          {mdi.who.experience}
        </p>
        {mdi.who.pending.length > 0 ? (
          <div className="mt-6 max-w-[62ch]">
            <Pending items={mdi.who.pending} />
          </div>
        ) : null}

        <h3 className="display mt-12 text-title">{mdi.applications.headline}</h3>
        <p className="mt-4 max-w-[62ch] text-body leading-relaxed text-ink-2">
          {mdi.applications.body}
        </p>
        <p className="mt-3 max-w-[62ch] text-body leading-relaxed text-ink-2">
          {mdi.applications.process}
        </p>
        <div className="mt-6 max-w-[62ch]">
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
                {cohorts.length > 0 ? (
          <CohortGrid items={cohorts} />
        ) : (
          <div className="border border-dashed border-line bg-surface p-8">
            <p className="max-w-[54ch] text-lead text-ink-2">{mdiCohortsCopy.empty}</p>
          </div>
        )}
      </Section>

      {/* changes-v2, 2026-09-23: the fees and funding band is withdrawn until
          the figures are confirmed; the page closes on the contact action. */}
      <Section tone="surface" eyebrow="Talk to us" title="Ask us about the programme.">
        <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">{mdi.applications.body}</p>
        <div className="mt-6">
          <Button href={mdi.applications.action.href}>{mdi.applications.action.label}</Button>
        </div>
      </Section>
    </>
  );
}
