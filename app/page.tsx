// Lucid: Home. Copy: HOME.
/*
  Decision R1, revised 2026-09-11: the three programmes now lead as a visual
  carousel, followed by the CDIE definition, services, supplied partner marks,
  and image-led recent activity.
*/

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { PartnerStrip } from "@/components/sections/PartnerStrip";
import { ProgrammeHeroCarousel } from "@/components/sections/ProgrammeHeroCarousel";
import { Section } from "@/components/sections/Section";
import { VisualCardRail } from "@/components/sections/VisualCardRail";
import { defineCdie, homeHero, latestCopy, latestHighlights, programmeHeroSlides, servicesCopy } from "@/content/home";
import { capabilities } from "@/content/studio";

export const metadata: Metadata = {
  description: homeHero.standfirst,
};

const serviceImages: Record<string, string> = {
  design: "/images/service-design-2.jpg",
  electronics: "/images/service-electronics-1.jpg",
  "three-d-printing": "/images/service-3dprinting-1.jpg",
  "co-working": "/images/service-coworking-1.jpg",
  metalworking: "/images/service-metalworking-1.jpeg",
  textiles: "/images/service-textile-1.jpg",
  woodworking: "/images/service-woodworking-1.jpeg",
};

const serviceCards = capabilities.map((capability) => ({
  id: capability.id,
  eyebrow: capability.name,
  title: capability.headline,
  summary: capability.body,
  image: serviceImages[capability.id],
  alt: `${capability.name} at the CDIE Design Studio`,
  href: `/design-studio?service=${capability.id}`,
  action: `Open ${capability.name}`,
}));

export default function HomePage() {
  return (
    <>
      <ProgrammeHeroCarousel slides={[...programmeHeroSlides]} />

      <Section tone="surface" eyebrow={defineCdie.eyebrow} title={defineCdie.headline}>
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <p aria-hidden="true" className="display text-mega leading-none text-brand">C.D.I.E</p>
          <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">{defineCdie.body}</p>
        </div>
        <ul className="mt-12 grid gap-px bg-line md:grid-cols-3">
          {defineCdie.triad.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 bg-raise p-6">
              <h3 className="display text-sub text-brand">{item.title}</h3>
              <p className="text-body leading-relaxed text-ink-2">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button href={defineCdie.action.href} tone="outline">
            {defineCdie.action.label}
          </Button>
        </div>
      </Section>

      <Section
        eyebrow={servicesCopy.eyebrow}
        title={servicesCopy.headline}
        standfirst={servicesCopy.standfirst}
      >
        <VisualCardRail items={serviceCards} label="studio capabilities" />
      </Section>

      <PartnerStrip />

      <Section tone="surface" eyebrow={latestCopy.eyebrow} title={latestCopy.headline}>
        <VisualCardRail items={[...latestHighlights]} label="recent CDIE activity" />
      </Section>
    </>
  );
}
