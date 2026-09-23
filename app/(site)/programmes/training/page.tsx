// Lucid: Programmes > Masterclasses and training. Copy: PROGRAMMES > Masterclasses and training.
// Every unconfirmed fact renders through Pending, never as a claim.

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { Pending } from "@/components/primitives/Pending";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { training, getOpportunity } from "@/content/programmes";

export const metadata: Metadata = {
  title: "Masterclasses and training",
  description: training.standfirst,
};

const crumbs = [
  { label: "Programmes", href: "/programmes" },
  { label: "Masterclasses and training", href: "/programmes/training" },
];

export default function TrainingPage() {
  const opportunity = getOpportunity("training");

  return (
    <>
      <PageHero
        eyebrow="Short format"
        headline={training.headline}
        standfirst={training.standfirst}
        crumbs={crumbs}
      >
        <Button href={training.action.href}>{training.action.label}</Button>
      </PageHero>

      <Section eyebrow="What is settled" title="What we can tell you today.">
        <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">
          {opportunity?.summary}
        </p>
        <div className="mt-8 max-w-[62ch]">
          <Pending items={opportunity?.pending ?? []} />
        </div>
        <p className="mt-6 max-w-[62ch] text-fine text-ink-3">
          No date, figure or requirement is published until the team confirms the current
          call. Ask and you will get the real answer rather than an out-of-date page.
        </p>
      </Section>
    </>
  );
}
