// Lucid: Programmes > Design Challenge. Copy: PROGRAMMES > Design Challenge.
// Every unconfirmed fact renders through Pending, never as a claim.

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { Pending } from "@/components/primitives/Pending";
import { ChallengeEdition } from "@/components/sections/ChallengeEdition";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { designChallenge, designChallengeEditions, getOpportunity } from "@/content/programmes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Design Challenge",
  description: designChallenge.standfirst,
  path: "/programmes/design-challenge",
});

const crumbs = [
  { label: "Programmes", href: "/programmes" },
  { label: "Design Challenge", href: "/programmes/design-challenge" },
];

export default function DesignChallengePage() {
  const opportunity = getOpportunity("design-challenge");

  return (
    <>
      <PageHero
        eyebrow="Challenge"
        headline={designChallenge.headline}
        standfirst={designChallenge.standfirst}
        crumbs={crumbs}
      >
        <Button href={designChallenge.action.href}>{designChallenge.action.label}</Button>
      </PageHero>

      {designChallengeEditions.map((edition) => (
        <ChallengeEdition key={edition.id} {...edition} />
      ))}

      <Section eyebrow="The next challenge" title="What we can tell you today.">
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
