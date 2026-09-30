// Lucid: Design Studio, virtual tour first. Copy: DESIGN STUDIO.
// Capabilities are selections inside this page, never child routes.

import type { Metadata } from "next";

import { FaqList } from "@/components/blocks/FaqList";
import { Section } from "@/components/sections/Section";
import { VisualCardRail, type VisualRailItem } from "@/components/sections/VisualCardRail";
import { StudioExplorer, type ExplorerCapability } from "@/components/studio/StudioExplorer";
import {
  capabilities,
  defaultCapabilityId,
  spaces,
  studioFaqs,
  studioIntro,
} from "@/content/studio";
import { studioPhotoOverrides, type StudioPhoto } from "@/lib/admin/store";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Design Studio",
  description: studioIntro.tourStandfirst,
  path: "/design-studio",
  image: { src: "/images/service-design-2.jpg", alt: "Design work in the CDIE studio" },
});

const spaceShortName = new Map(spaces.map((space) => [space.id, space.shortName]));
const spaceNames = new Map(spaces.map((space) => [space.id, space.name]));

const studioImages: Record<string, string> = {
  design: "/images/service-design-2.jpg",
  electronics: "/images/service-electronics-1.jpg",
  "three-d-printing": "/images/cdie-3d-printers.jpg",
  "co-working": "/images/service-coworking-1.jpg",
  metalworking: "/images/service-metalworking-1.jpeg",
  textiles: "/images/cdie-textiles-sewing.jpg",
  woodworking: "/images/service-woodworking-1.jpeg",
  // 2026-09-23: studio photographs supplied for 3D printers, textiles and laser engraving.
  "laser-cutting": "/images/cdie-laser-engraving-machine.jpg",
  // 2026-09-23: "use this for casting and molding service".
  "casting-moulding": "/images/service-casting-moulding-1.webp",
};

// The heading counts the capabilities rather than stating a number that goes
// stale when one is added (laser cutting made it eight).
const countWord = (n: number) =>
  ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"][n] ?? String(n);

/* Review 2026-09-30: photographs set in the dashboard replace a capability's
   own list, in the editor's order; the first leads. */
type Photos = Record<string, readonly StudioPhoto[]>;
const photosOf = (id: string, overrides: Photos) => overrides[id] ?? capabilities.find((item) => item.id === id)?.media ?? [];

const explorerCapabilities = (overrides: Photos): ExplorerCapability[] => capabilities.map((capability) => ({
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
  // 2026-09-25: a capability's first photograph leads; the map is the fallback.
  image: photosOf(capability.id, overrides)[0]?.src ?? studioImages[capability.id],
  media: photosOf(capability.id, overrides),
  components: capability.components,
}));

/* Final pass 2026-09-23: "switch the labelling of the cards". The workshop
   area (Design and CAD, Electronics) is on the card at rest; the location it
   sits in is what the card shows on hover. */
const capabilityCards = (overrides: Photos): VisualRailItem[] => capabilities.map((capability) => ({
  id: capability.id,
  eyebrow: capability.name,
  title: spaceNames.get(capability.space) ?? capability.space,
  summary: capability.headline,
  image: photosOf(capability.id, overrides)[0]?.src ?? studioImages[capability.id],
  alt: photosOf(capability.id, overrides)[0]?.alt ?? `${capability.name} at the CDIE Design Studio`,
  href: `/design-studio?service=${capability.id}`,
  action: "Explore in the room",
}));

/* Final pass 2026-09-23: "use only 5 relevant FAQs on each page". Access,
   booking, first-time help, hours and directions: what a visitor needs before
   coming in. The full vetted list stays in content/studio.ts. */
const PAGE_FAQS = ["who", "booking", "unfamiliar", "hours", "where"];
const pageFaqs = PAGE_FAQS.flatMap((id) => studioFaqs.filter((faq) => faq.id === id));

export default async function DesignStudioPage(props: PageProps<"/design-studio">) {
  const query = await props.searchParams;
  const requested = typeof query.service === "string" ? query.service : undefined;
  const initialId =
    requested && capabilities.some((item) => item.id === requested)
      ? requested
      : defaultCapabilityId;
  const overrides = await studioPhotoOverrides();

  return (
    <>
      <StudioExplorer
        capabilities={explorerCapabilities(overrides)}
        initialId={initialId}
        intro={{ headline: studioIntro.tourHeadline, standfirst: studioIntro.tourStandfirst }}
      />

      {/*
        Change request 2026-09-13, section 3.1. The explorer shows one
        capability at a time, which is right for the room but gives no sense of
        how many there are. The rail answers "what else is in here" without
        making the visitor click through the model. Selecting a card returns to
        the explorer with that capability open, so the two stay in step.
      */}
      <Section
        eyebrow="Capabilities"
        title={`${countWord(capabilities.length)} ways to make something.`}
        standfirst="Browse the workshop areas, then open any one of them in the room above."
      >
        <VisualCardRail items={capabilityCards(overrides)} label="studio capabilities" />
      </Section>

      {/* Review 2026-09-30: "remove the two sides section in design studio",
          its workshop photographs with it. The two spaces still name every
          capability card and the room switch in the explorer above. */}
      {/* Enhancements 2026-09-22: "remove access section in design studio page".
          The FAQs it carried stay, in a band of their own. */}
      <Section eyebrow="FAQs" title="Questions about the studio.">
        <div>
          {/* Change request 2026-09-21, second pass: "require manual input and
              confirmation for all faqs". An unconfirmed answer sends the
              reader to the studio enquiry rather than publishing a sentence
              nobody has stood behind. */}
          <FaqList items={pageFaqs} enquiryHref="/contact?topic=studio" />
        </div>
      </Section>
    </>
  );
}
