// Block. A grid of photographs; alt text describes only what is in the frame.
/*
  2026-09-24: the Catalyst grant beneficiaries gallery. It takes however many
  photographs have been supplied and centres a short last row.

  Review 2026-10-19: a single photograph no longer sits alone as a small
  square. It takes the Catalyst poster's circle, centred and larger.
*/

import Image from "next/image";

import { CirclePhoto } from "@/components/blocks/CirclePhoto";

export type GalleryPhoto = { src: string; alt: string };

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  if (photos.length === 0) return null;
  if (photos.length === 1) {
    const [photo] = photos;
    return <CirclePhoto src={photo.src} alt={photo.alt} sizes="(max-width: 640px) 80vw, 28rem" className="mx-auto w-full max-w-[28rem]" />;
  }
  return (
    <ul className="flex flex-wrap justify-center gap-4">
      {photos.map((photo) => (
        <li key={photo.src} className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-raise sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]">
          <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
        </li>
      ))}
    </ul>
  );
}
