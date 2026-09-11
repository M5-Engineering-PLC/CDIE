// Lucid: Design Studio, virtual tour first. Copy: DESIGN STUDIO.
// Capabilities are selections inside this page, never child routes.

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { Section } from "@/components/sections/Section";
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

const spaceName = new Map(spaces.map((space) => [space.id, space.name]));

const studioImages: Record<string, string> = {
  design: "/images/service-design-2.jpg",
  electronics: "/images/service-electronics-1.jpg",
  "three-d-printing": "/images/service-3dprinting-1.jpg",
  "co-working": "/images/service-coworking-1.jpg",
  metalworking: "/images/service-metalworking-1.jpeg",
  textiles: "/images/service-textile-1.jpg",
  woodworking: "/images/service-woodworking-1.jpeg",
};

const explorerCapabilities: ExplorerCapability[] = capabilities.map((capability) => ({
  id: capability.id,
  name: capability.name,
  spaceName: spaceName.get(capability.space) ?? capability.space,
  headline: capability.headline,
  body: capability.body,
  modelGroup: capability.modelGroup,
  pending: capability.pending,
  enquiry: capability.enquiry,
  enquiryHref: "/contact?topic=studio",
  image: studioImages[capability.id],
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
      <div className="shell py-6">
        <p className="max-w-[70ch] text-fine text-ink-3">
          Photographs and short demonstrations are added as each area is captured. Until
          then the room gives you the layout and the text gives you the capability.
        </p>
      </div>

      <Section
        eyebrow="The studio"
        title={studioIntro.headline}
        standfirst={studioIntro.body}
      >
        <ul className="grid gap-px bg-line md:grid-cols-2">
          {spaces.map((space) => (
            <li key={space.id} className="flex flex-col gap-3 bg-surface p-6">
              <div className="flex items-center gap-3">
                <h3 className="display text-sub">{space.name}</h3>
                <span className="font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">
                  {space.hasModel ? "Room model" : "Photographs only"}
                </span>
              </div>
              <p className="text-body leading-relaxed text-ink-2">{space.summary}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface" eyebrow="Access" title={studioAccess.headline}>
        <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">{studioAccess.body}</p>
        <div className="mt-6">
          <Button href={studioAccess.action.href}>{studioAccess.action.label}</Button>
        </div>

        <dl className="mt-12 flex flex-col gap-px bg-line">
          {studioFaqs.map((faq) => (
            <div key={faq.id} className="bg-raise p-6">
              <dt className="text-lead text-ink">{faq.question}</dt>
              <dd className="mt-2 max-w-[64ch] text-body leading-relaxed text-ink-2">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
