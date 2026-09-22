// Lucid: Design Studio, virtual tour first. Copy: DESIGN STUDIO.
// Capabilities are selections inside this page, never child routes.

import type { Metadata } from "next";

import { FaqList } from "@/components/blocks/FaqList";
import { Button } from "@/components/primitives/Button";
import { Section } from "@/components/sections/Section";
import { WorkshopGallery } from "@/components/sections/WorkshopGallery";
import { VisualCardRail, type VisualRailItem } from "@/components/sections/VisualCardRail";
import { StudioExplorer, type ExplorerCapability } from "@/components/studio/StudioExplorer";
import {
  capabilities,
  defaultCapabilityId,
  spaces,
  studioAccess,
  studioFaqs,
  studioIntro,
} from "@/content/studio";

export const metadata: Metadata = {
  title: "Design Studio",
  description: studioIntro.tourStandfirst,
};

const spaceShortName = new Map(spaces.map((space) => [space.id, space.shortName]));

const studioImages: Record<string, string> = {
  design: "/images/service-design-2.jpg",
  electronics: "/images/service-electronics-1.jpg",
  "three-d-printing": "/images/service-3dprinting-1.jpg",
  "co-working": "/images/service-coworking-1.jpg",
  metalworking: "/images/service-metalworking-1.jpeg",
  textiles: "/images/service-textile-2.jpg",
  woodworking: "/images/service-woodworking-1.jpeg",
};

const workshopPhotos = [
  { src: "/images/cdie-woodwork-mitre-saw.jpg", alt: "Student cutting timber on a mitre saw" },
  { src: "/images/cdie-electronics-soldering.jpg", alt: "Hands soldering a circuit board" },
  { src: "/images/cdie-studio-laptop-working-session.jpg", alt: "Students gathered around a laptop at a studio bench" },
  { src: "/images/cdie-3d-printing-heart-model-01.jpeg", alt: "3D printer finishing a model of a human heart" },
];

const explorerCapabilities: ExplorerCapability[] = capabilities.map((capability) => ({
  id: capability.id,
  name: capability.name,
  space: capability.space,
  spaceName: spaceShortName.get(capability.space) ?? capability.space,
  atc: capability.space === "atc",
  headline: capability.headline,
  body: capability.body,
  modelGroup: capability.modelGroup,
  pending: capability.pending,
  enquiry: capability.enquiry,
  enquiryHref: "/contact?topic=studio",
  image: studioImages[capability.id],
  components: capability.components,
}));

const capabilityCards: VisualRailItem[] = capabilities.map((capability) => ({
  id: capability.id,
  eyebrow: spaceShortName.get(capability.space) ?? capability.space,
  title: capability.name,
  summary: capability.headline,
  image: studioImages[capability.id],
  alt: `${capability.name} at the CDIE Design Studio`,
  href: `/design-studio?service=${capability.id}`,
  action: "Explore in the room",
}));

export default async function DesignStudioPage(props: PageProps<"/design-studio">) {
  const query = await props.searchParams;
  const requested = typeof query.service === "string" ? query.service : undefined;
  const initialId =
    requested && capabilities.some((item) => item.id === requested)
      ? requested
      : defaultCapabilityId;

  return (
    <>
      <StudioExplorer capabilities={explorerCapabilities} initialId={initialId} />

      {/*
        Change request 2026-09-13, section 3.1. The explorer shows one
        capability at a time, which is right for the room but gives no sense of
        how many there are. The rail answers "what else is in here" without
        making the visitor click through the model. Selecting a card returns to
        the explorer with that capability open, so the two stay in step.
      */}
      <Section
        eyebrow="Capabilities"
        title="Seven ways to make something."
        standfirst="Browse the workshop areas, then open any one of them in the room above."
      >
        <VisualCardRail items={capabilityCards} label="studio capabilities" />
      </Section>

      <Section tone="surface" eyebrow="The two sides" title="Where the work happens.">
        <ul className="grid gap-px bg-line md:grid-cols-2">
          {spaces.map((space) => (
            <li key={space.id} className="flex flex-col gap-2 bg-surface p-5 md:gap-3 md:p-6">
              <div className="flex items-center gap-3">
                <h3 className="display text-sub">{space.name}</h3>
                <span className="font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">
                  {space.hasModel ? "Room model" : "Photographs only"}
                </span>
              </div>
              <p className="hidden text-body leading-relaxed text-ink-2 md:block">{space.summary}</p>
            </li>
          ))}
        </ul>
        {/* Image matching sheet 2026-09-22, Design Studio D11-D14: workshop areas. */}
        <div className="mt-6 md:mt-8">
          <WorkshopGallery items={workshopPhotos} />
        </div>
      </Section>

      <Section tone="surface" eyebrow="Access" title={studioAccess.headline}>
        <p className="hidden max-w-[62ch] text-lead leading-relaxed text-ink-2 md:block">{studioAccess.body}</p>
        <div className="mt-6">
          <Button href={studioAccess.action.href}>{studioAccess.action.label}</Button>
        </div>

        <div className="mt-8 md:mt-12">
          {/* Change request 2026-09-21, second pass: "require manual input and
              confirmation for all faqs". An unconfirmed answer sends the
              reader to the studio enquiry rather than publishing a sentence
              nobody has stood behind. */}
          <FaqList items={[...studioFaqs]} enquiryHref="/contact?topic=studio" />
        </div>
      </Section>
    </>
  );
}
