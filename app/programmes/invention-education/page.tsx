// Lucid: Programmes > IvE. MDI sits under it as the flagship track; routing
// keeps them siblings and the relationship is carried here in prose.
// Copy: PROGRAMMES > Invention Education.

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { inventionEducation, learningStages } from "@/content/programmes";

export const metadata: Metadata = {
  title: "Invention Education",
  description: inventionEducation.standfirst,
};

const crumbs = [
  { label: "Programmes", href: "/programmes" },
  { label: "Invention Education", href: "/programmes/invention-education" },
];

export default function InventionEducationPage() {
  return (
    <>
      <PageHero
        eyebrow="Learning model"
        headline={inventionEducation.headline}
        standfirst={inventionEducation.standfirst}
        crumbs={crumbs}
      />

      <Section eyebrow="The approach" title="Learning through real problems.">
        <div className="prose-body max-w-[62ch] text-lead leading-relaxed text-ink-2">
          {inventionEducation.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section tone="surface" eyebrow="The learning model" title="Four stages, in order.">
        <ol className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
          {learningStages.map((stage, index) => (
            <li key={stage.id} className="flex flex-col gap-3 bg-raise p-6">
              <span className="font-mono text-fine text-brand-live">
                Stage {index + 1} of {learningStages.length}
              </span>
              <h3 className="display text-sub leading-snug">{stage.title}</h3>
              <p className="text-body leading-relaxed text-ink-2">{stage.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Take-aways" title="What you leave with.">
        <p className="max-w-[58ch] text-lead leading-relaxed text-ink-2">
          {inventionEducation.takeaways}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={inventionEducation.action.href}>
            {inventionEducation.action.label}
          </Button>
          <Button href={inventionEducation.enquiry.href} tone="outline">
            {inventionEducation.enquiry.label}
          </Button>
        </div>
      </Section>
    </>
  );
}
