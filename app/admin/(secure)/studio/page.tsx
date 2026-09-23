// Admin review surface for the same read-only Design Studio tour used by the public page.

import { StudioExplorer, type ExplorerCapability } from "@/components/studio/StudioExplorer";
import { capabilities, defaultCapabilityId, spaces, studioIntro } from "@/content/studio";

export const dynamic = "force-dynamic";

const spaceShortName = new Map(spaces.map((space) => [space.id, space.shortName]));

const studioImages: Record<string, string> = {
  design: "/images/service-design-2.jpg",
  electronics: "/images/service-electronics-1.jpg",
  "three-d-printing": "/images/cdie-3d-printers.jpg",
  "co-working": "/images/service-coworking-1.jpg",
  metalworking: "/images/service-metalworking-1.jpeg",
  textiles: "/images/cdie-textiles-sewing.jpg",
  woodworking: "/images/service-woodworking-1.jpeg",
  "laser-cutting": "/images/cdie-laser-engraving-machine.jpg",
  "casting-moulding": "/images/service-casting-moulding-1.webp",
};

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

export default async function AdminStudioPage(props: PageProps<"/admin/studio">) {
  const query = await props.searchParams;
  const requested = typeof query.service === "string" ? query.service : undefined;
  const initialId =
    requested && capabilities.some((item) => item.id === requested)
      ? requested
      : defaultCapabilityId;

  return (
    <main className="mx-auto flex max-w-[90rem] flex-col gap-6 p-6 md:p-10">
      <header className="flex flex-col gap-2">
        <p className="kicker">Read-only review</p>
        <h1 className="text-head text-ink">Design Studio</h1>
        <p className="max-w-[68ch] text-body leading-relaxed text-ink-2">
          This view uses the same tour and room model as the public Design Studio page. It has no content editing controls.
        </p>
      </header>
      <StudioExplorer
        capabilities={explorerCapabilities}
        initialId={initialId}
        intro={{ headline: studioIntro.tourHeadline, standfirst: studioIntro.tourStandfirst }}
      />
    </main>
  );
}
