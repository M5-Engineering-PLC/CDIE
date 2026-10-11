// Dashboard, Design Studio: each workshop area's photographs. Internal tooling, not a website surface.
/*
  Review 2026-09-30: "remove 3d view, remove highlighted in the room text
  section, only thing they can change is photographs, show current ones and a
  plus icon to add more images, change order, delete them". The room model is
  not editable, so it is no longer shown here.

  Fix plan 2026-10-11, D2 and D7: the page reads each area's saved list and
  its version, and the editor drafts changes against them until they are saved.
*/

import { StudioPhotoEditor } from "@/components/admin/StudioPhotoEditor";
import { capabilities, defaultCapabilityId } from "@/content/studio";
import { studioPhotoLists } from "@/lib/admin/store";
import type { StudioArea } from "@/lib/admin/studioDraft";

export const dynamic = "force-dynamic";

export default async function AdminStudioPage(props: PageProps<"/admin/studio">) {
  const query = await props.searchParams;
  const selected = capabilities.find((item) => item.id === query.area) ?? capabilities.find((item) => item.id === defaultCapabilityId) ?? capabilities[0];
  const lists = await studioPhotoLists();
  const areas: StudioArea[] = capabilities.map((item) => ({
    id: item.id,
    name: item.name,
    at: lists[item.id]?.at ?? "",
    photos: (lists[item.id]?.photos ?? item.media).map(({ src, alt, width, height }) => ({ src, alt, width, height })),
  }));

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 p-6 md:p-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-head text-ink">Design Studio photographs</h1>
        <p className="max-w-[68ch] text-body text-ink-2">
          The first photograph leads: it is the workshop card&apos;s picture and the first one visitors see. Changes stay on this page until you review and save them, then show on the Design Studio page.
        </p>
      </header>
      <StudioPhotoEditor areas={areas} initialArea={selected.id} />
    </main>
  );
}
