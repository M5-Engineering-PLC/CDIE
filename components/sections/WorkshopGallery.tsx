// Section. Image matching sheet, Design Studio > Workshop areas (D11-D14).
// Photographs only: each frame is a real CDIE image, described by what is visible.

import Image from "next/image";

import { AutoRail } from "./AutoRail";

export function WorkshopGallery({ items }: { items: { src: string; alt: string }[] }) {
  if (items.length === 0) return null;
  return (
    <AutoRail
      label="Workshop areas"
      className="rail -mx-gutter auto-cols-[78%] gap-3 px-gutter md:mx-0 md:grid-flow-row md:auto-cols-auto md:grid-cols-4 md:overflow-visible md:px-0"
    >
      {items.map((item) => (
        <li key={item.src} className="relative aspect-[4/3] overflow-hidden bg-raise">
          <Image src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 78vw, 25vw" className="object-cover transition duration-500 hover:scale-105" />
        </li>
      ))}
    </AutoRail>
  );
}
