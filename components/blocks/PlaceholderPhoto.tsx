// Block. Wraps an image that is standing in for photography CDIE has not taken yet.
/*
  The frame around a photograph on the programmes list. The alt text describes
  what is visible in the frame, never what the picture is meant to represent.
*/

import Image from "next/image";

export type PlaceholderPhotoProps = {
  src: string;
  /** What is visible in the frame. Never what the picture is meant to represent. */
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function PlaceholderPhoto({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
}: PlaceholderPhotoProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
