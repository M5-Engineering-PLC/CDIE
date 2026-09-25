"use client";

// Daily note 2026-09-25: "for design studio photographs, we can have several
// photos featured". The strip shows every photograph a capability carries
// beyond the one on the stage. It renders nothing when there is only one.

import Image from "next/image";

export type StudioPhoto = { src: string; alt: string };

export function StudioPhotoStrip({ photos, capabilityName }: { photos: readonly StudioPhoto[]; capabilityName: string }) {
  const more = photos.slice(1);
  if (more.length === 0) return null;
  return (
    <section aria-label={`More photographs of ${capabilityName}`}>
      <p className="kicker mb-3">More from this area</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {more.map((photo) => (
          <li key={photo.src} className="relative aspect-[4/3] overflow-hidden border border-line bg-raise">
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
          </li>
        ))}
      </ul>
    </section>
  );
}
