// Block. A photograph cut to a circle with a white rim, after the Catalyst Grant poster.

import Image from "next/image";

export type CirclePhotoProps = { src: string; alt: string; sizes: string; className?: string };

export function CirclePhoto({ src, alt, sizes, className = "" }: CirclePhotoProps) {
  return (
    <div className={`relative aspect-square overflow-hidden rounded-full border-[6px] border-surface bg-raise shadow-xl md:border-8 ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
