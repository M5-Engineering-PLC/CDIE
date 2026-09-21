// Block. Wraps an image that is standing in for photography CDIE has not taken yet.
/*
  Change request 2026-09-21, section 3: "the picture should be tied to the
  program it represents, its confusing and can mislead", alongside "we have
  images left to take though, so we are very cognizant of the placeholder
  issue".

  Both are the same problem. A general workshop photograph placed beside
  Catalyst grants reads as a picture of Catalyst grants, and the alt text made
  that reading explicit. There is no programme-specific photography yet, so the
  honest fix is not a different photograph: it is to stop the picture making a
  claim. The alt text now describes only what is visible, and a corner tag says
  the image is a placeholder.

  This is the claim-safety rule in AGENTS.md applied to pictures: an
  unconfirmed fact never publishes as a claim. Swap the source and drop
  `standingIn` the moment the real photograph exists, and the tag disappears.
*/

import Image from "next/image";

export type PlaceholderPhotoProps = {
  src: string;
  /** What is visible in the frame. Never what the picture is meant to represent. */
  alt: string;
  sizes: string;
  className?: string;
  /** false once CDIE's own photograph for this subject is in place */
  standingIn?: boolean;
  priority?: boolean;
};

export function PlaceholderPhoto({
  src,
  alt,
  sizes,
  className = "",
  standingIn = true,
  priority = false,
}: PlaceholderPhotoProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {standingIn ? (
        <p className="absolute bottom-0 left-0 bg-ink/75 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-widest text-surface">
          Placeholder image
        </p>
      ) : null}
    </div>
  );
}
