// Lucid: Home. Copy: HOME.
/*
  Decision R1, revised 2026-09-11: the three programmes now lead as a visual
  carousel, followed by the CDIE definition, services, supplied partner marks,
  and image-led recent activity.

  Change request 2026-09-21, second pass, Home:
  - "remove CDIE photo, keep the initials and three images for innovate
    convene, create". The photograph the first pass put at the head of the
    definition band is withdrawn and the C.D.I.E lettering returns. The three
    words keep the pictures they gained, as a swipe-able rail on a phone and
    the same three-up grid above it.
  - "remove meet cdie button". About Us is in the bar and in the footer, so the
    button repeated a link the reader already has.
  - "remove in the studio sub title". The line said what the cards themselves
    show.

  Our latest still shows one card at a time and moves on after three seconds
  unless the reader is holding it.
*/

import type { Metadata } from "next";

import { PartnerStrip } from "@/components/sections/PartnerStrip";
import { ProgrammeHeroCarousel } from "@/components/sections/ProgrammeHeroCarousel";
import { Section } from "@/components/sections/Section";
import { SoloCardCarousel } from "@/components/sections/SoloCardCarousel";
import { TriadRail } from "@/components/sections/TriadRail";
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
  textiles: "/images/service-textile-2.jpg",
  woodworking: "/images/service-woodworking-1.jpeg",
  // Enhancements 2026-09-22: "for laser use the image titled summer program".
  "laser-cutting": "/images/cdie-summer-program-laser-cutting.jpg",
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

const [descriptionBefore, ...descriptionAfter] = defineCdie.body.split(
  "Centre for Design, Innovation & Engineering",
);

export default function HomePage() {
  return (
    <>
      <ProgrammeHeroCarousel slides={[...programmeHeroSlides]} />

      <Section tone="surface" eyebrow={defineCdie.eyebrow} title={defineCdie.headline}>
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div className="cdie-mark-stage self-center">
            <p aria-hidden="true" className="cdie-mark display text-mega leading-none text-brand">C.D.I.E</p>
          </div>
          <p className="max-w-[62ch] text-body leading-relaxed text-ink-2 md:text-lead">
            {descriptionBefore}
            <strong className="cdie-initial">C</strong>entre for{" "}
            <strong className="cdie-initial">D</strong>esign,{" "}
            <strong className="cdie-initial">I</strong>nnovation &amp;{" "}
            <strong className="cdie-initial">E</strong>ngineering{" "}
            {descriptionAfter.join("Centre for Design, Innovation & Engineering").trimStart()}
          </p>
        </div>

        <div className="mt-6 md:mt-12">
          <TriadRail items={defineCdie.triad} />
        </div>
      </Section>

      <Section eyebrow={servicesCopy.eyebrow} title={servicesCopy.headline}>
        <VisualCardRail items={serviceCards} label="studio capabilities" />
      </Section>

      <PartnerStrip />

      <Section tone="surface" eyebrow={latestCopy.eyebrow} title={latestCopy.headline}>
        <SoloCardCarousel items={[...latestHighlights]} label="recent CDIE activity" />
      </Section>
    </>
  );
}
