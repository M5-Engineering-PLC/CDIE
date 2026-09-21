// Lucid: Home. Copy: HOME.
/*
  Decision R1, revised 2026-09-11: the three programmes now lead as a visual
  carousel, followed by the CDIE definition, services, supplied partner marks,
  and image-led recent activity.

  Change request 2026-09-21, section 2. The definition band now opens with a
  photograph rather than the C.D.I.E lettering, which was decoration standing
  where a picture of the place belongs. Its three words are a swipe-able rail
  on a phone and the same three-up grid above it. Our latest shows one card at
  a time and moves on after three seconds unless the reader is holding it.
*/

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { PartnerStrip } from "@/components/sections/PartnerStrip";
import { ProgrammeHeroCarousel } from "@/components/sections/ProgrammeHeroCarousel";
import { Section } from "@/components/sections/Section";
import { SoloCardCarousel } from "@/components/sections/SoloCardCarousel";
import { TriadRail } from "@/components/sections/TriadRail";
import { VisualCardRail } from "@/components/sections/VisualCardRail";
import { defineCdie, homeHero, latestCopy, latestHighlights, programmeHeroSlides, servicesCopy } from "@/content/home";
import { capabilities } from "@/content/studio";

import Image from "next/image";

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
  // Change request 2026-09-21: "instead of open ..., just say read more/explore".
  action: `Explore ${capability.name.toLowerCase()}`,
}));

export default function HomePage() {
  return (
    <>
      <ProgrammeHeroCarousel slides={[...programmeHeroSlides]} />

      <Section tone="surface" eyebrow={defineCdie.eyebrow} title={defineCdie.headline}>
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="relative aspect-[5/4] overflow-hidden border border-line">
            <Image
              src={defineCdie.image.src}
              alt={defineCdie.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <p className="trim-mobile max-w-[62ch] text-body leading-relaxed text-ink-2 md:text-lead">
            {defineCdie.body}
          </p>
        </div>

        <div className="mt-6 md:mt-12">
          <TriadRail items={defineCdie.triad} />
        </div>

        <div className="mt-6 md:mt-8">
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
        <SoloCardCarousel items={[...latestHighlights]} label="recent CDIE activity" />
      </Section>
    </>
  );
}
