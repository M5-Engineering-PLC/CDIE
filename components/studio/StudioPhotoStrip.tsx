"use client";

// Daily note 2026-09-25: "for design studio photographs, we can have several
// photos featured". The strip shows every photograph a capability carries
// beyond the one on the stage. It renders nothing when there is only one.
//
// Follow-up 2026-09-25: "some of the photos are cropped in and don't show the
// full view; fill those images on one line". Each frame takes its own
// photograph's aspect ratio and grows in proportion to it, so one row fills
// the width edge to edge on a desktop and nothing is cropped. On a phone the
// frames stack, each the full width.

import Image from "next/image";

export type StudioPhoto = { src: string; alt: string; width: number; height: number };

export function StudioPhotoStrip({ photos, capabilityName }: { photos: readonly StudioPhoto[]; capabilityName: string }) {
  const more = photos.slice(1);
  if (more.length === 0) return null;
  return (
    <section aria-label={`More photographs of ${capabilityName}`}>
      <p className="kicker mb-3">More from this area</p>
      <ul className="flex flex-wrap gap-3 sm:flex-nowrap">
        {more.map((photo) => (
          <li
            key={photo.src}
            className="relative basis-full overflow-hidden border border-line bg-raise sm:basis-0"
            style={{ aspectRatio: `${photo.width} / ${photo.height}`, flexGrow: photo.width / photo.height }}
          >
            <Image src={photo.src} alt={photo.alt} fill sizes={`(max-width: 640px) 100vw, ${Math.round(70 / more.length)}vw`} className="object-contain" />
          </li>
        ))}
      </ul>
    </section>
  );
}
