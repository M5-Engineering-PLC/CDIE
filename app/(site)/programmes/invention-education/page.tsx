// Lucid: Programmes > IvE. MDI sits under it as the flagship track; routing
// keeps them siblings and the relationship is carried here in prose.
// Copy: PROGRAMMES > Invention Education.

import type { Metadata } from "next";
import { Fragment } from "react";

import { Button } from "@/components/primitives/Button";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { InlineFigure } from "@/components/blocks/InlineFigure";
import { SnakeRoute } from "@/components/sections/SnakeRoute";
import { inventionEducation, learningStages } from "@/content/programmes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Invention Education",
  description: inventionEducation.standfirst,
  path: "/programmes/invention-education",
  image: { src: "/images/cdie-summer-program-clinical-immersion-group.jpg", alt: "Summer programme participants in scrubs outside a hospital" },
});

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
        image={{
          src: "/images/cdie-summer-program-clinical-immersion-group.jpg",
          alt: "Summer programme participants in scrubs outside a hospital",
        }}
      />

      {/* changes-v2 item 13: photographs break up the long description. */}
      <Section eyebrow="The approach" title="Learning through real problems.">
        <div className="prose-body max-w-[62ch] text-lead leading-relaxed text-ink-2">
          {inventionEducation.body.map((paragraph, index) => (
            <Fragment key={paragraph}>
              <p>{paragraph}</p>
              {index === 0 ? (
                <InlineFigure
                  src="/images/cdie-summer-program-needs-filtering.jpg"
                  alt="Participants working through needs filtering at tables"
                />
              ) : null}
              {index === 1 ? (
                <InlineFigure
                  src="/images/cdie-summer-program-cnc-class-01.jpg"
                  alt="A participant operating a CNC machine"
                />
              ) : null}
            </Fragment>
          ))}
        </div>
      </Section>

      <Section tone="surface" eyebrow="The learning model" title="Four stages, in order.">
        <SnakeRoute stages={learningStages} />
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
