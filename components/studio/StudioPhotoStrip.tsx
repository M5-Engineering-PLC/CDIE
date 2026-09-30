"use client";

// Daily note 2026-09-25: "for design studio photographs, we can have several
// photos featured".
/*
  Review 2026-09-30: "on design studio, photographs, the main image should be a
  bit smaller, then have a strip of smaller images that can be selected to be
  main image".

  Every photograph a capability carries sits here as a thumbnail, the one on
  the stage included and marked, so the strip is also a count of what there is.
  Choosing one puts it on the stage (and brings the stage back to photographs
  if the 3D room was open). Each thumbnail keeps its photograph's own shape at
  one shared height, and the row scrolls sideways when it runs out of width.
  Renders nothing when there is only one photograph.
*/

import Image from "next/image";

export type StudioPhoto = { src: string; alt: string; width: number; height: number };

export function StudioPhotoStrip({ photos, capabilityName, current, onPick }: {
  photos: readonly StudioPhoto[];
  capabilityName: string;
  current: number;
  onPick: (index: number) => void;
}) {
  if (photos.length < 2) return null;
  return (
    <div role="group" aria-label={`Photographs of ${capabilityName}`}>
      <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {photos.map((photo, index) => {
          const on = index === current;
          return (
            <li key={photo.src} className="shrink-0">
              <button
                type="button"
                aria-pressed={on}
                aria-label={`Show photograph ${index + 1} of ${photos.length}: ${photo.alt}`}
                onClick={() => onPick(index)}
                className={`relative block h-16 overflow-hidden border-2 bg-raise transition-[border-color,opacity] duration-(--motion-swift) md:h-20 ${
                  on ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              >
                <Image src={photo.src} alt="" fill sizes="10rem" className="object-contain" draggable={false} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
