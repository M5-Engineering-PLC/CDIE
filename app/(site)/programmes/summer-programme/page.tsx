// Not in Lucid: added at the client's request, daily note 2026-09-25 (conflict C-09).
// Copy: CDIE's own posts, via the CDIE LinkedIn feed sheet. Unconfirmed facts render through Pending.

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { Pending } from "@/components/primitives/Pending";
import { ChallengeEdition } from "@/components/sections/ChallengeEdition";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { getOpportunity, summerProgramme, summerProgrammeEditions } from "@/content/programmes";
import { socialAccounts } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Summer Programme",
  description: summerProgramme.standfirst,
  path: "/programmes/summer-programme",
  image: { src: "/images/cdie-summer-program-clinical-immersion-group.jpg", alt: "Summer programme participants in scrubs outside a hospital" },
});

const crumbs = [
  { label: "Programmes", href: "/programmes" },
  { label: "Summer Programme", href: "/programmes/summer-programme" },
];

export default function SummerProgrammePage() {
  const opportunity = getOpportunity("summer-programme");
  const linkedIn = socialAccounts.find((account) => account.id === "linkedin");

  return (
    <>
      <PageHero
        eyebrow="Short course"
        headline={summerProgramme.headline}
        standfirst={summerProgramme.standfirst}
        crumbs={crumbs}
        image={{
          src: "/images/cdie-summer-program-cnc-class-04.jpg",
          alt: "Participant in gloves setting up a CNC machine",
        }}
      >
        <Button href={summerProgramme.action.href}>{summerProgramme.action.label}</Button>
      </PageHero>

      {summerProgrammeEditions.map((edition) => (
        <ChallengeEdition
          key={edition.id}
          id={edition.id}
          year={edition.year}
          theme={edition.theme}
          brief={edition.brief}
          facts={edition.facts}
          call={edition.call}
          link={edition.link}
          winners={edition.photos}
          label="Summer Programme"
          galleryTitle="From the programme"
        />
      ))}

      <Section eyebrow="The next programme" title="What we can tell you today.">
        <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">
          {opportunity?.summary}
        </p>
        <div className="mt-8 max-w-[62ch]">
          <Pending items={opportunity?.pending ?? []} />
        </div>
        {linkedIn?.href ? (
          <div className="mt-8">
            <Button href={linkedIn.href} external>
              Follow us on LinkedIn for the next call
            </Button>
          </div>
        ) : null}
      </Section>
    </>
  );
}
