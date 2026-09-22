// Actual Copy: Design Studio capability bodies. Names are drawn from them.
/*
  Change request 2026-09-21, section 4: "when the 3JS focuses into PC, an image
  of the different softwares people use should pop up", and "for now just use
  generic placeholders for different components within any specific service".

  One tile per thing the highlighted station stands for. The frame is empty and
  says so: CDIE has not photographed the individual benches, screens or tools
  yet, and dropping a general studio photograph into a tile captioned
  "measurement equipment" would publish a claim the picture does not support.
  Give a component an `image` and the frame fills; nothing else changes.
*/

import Image from "next/image";

import { AutoRail } from "@/components/sections/AutoRail";

import type { ExplorerComponent } from "./explorerModel";

export function StudioComponentGrid({
  items,
  capabilityName,
}: {
  items: readonly ExplorerComponent[];
  capabilityName: string;
}) {
  // Enhancements 2026-09-22: "dont have any empty photos, only enable a card if
  // a photo for it exists". An unphotographed component gets no tile.
  const photographed = items.filter((item) => item.image);
  if (photographed.length === 0) return null;

  return (
    <section className="min-w-0" aria-label={`What ${capabilityName.toLowerCase()} covers`}>
      <p className="kicker">In this area</p>
      <AutoRail className="rail mt-3 auto-cols-[62%] gap-3 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {photographed.map((item) => (
          <li key={item.id} className="flex flex-col border border-line bg-surface">
            <div className="relative aspect-[4/3] overflow-hidden bg-raise">
              <Image
                src={item.image as string}
                alt={item.alt ?? ""}
                fill
                sizes="(max-width: 640px) 62vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-1 p-4">
              <h4 className="text-body font-semibold text-ink">{item.name}</h4>
              <p className="text-fine leading-relaxed text-ink-2">{item.note}</p>
            </div>
          </li>
        ))}
      </AutoRail>
    </section>
  );
}
