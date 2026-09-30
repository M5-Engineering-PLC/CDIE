"use client";

// Section. Copy: HOME > Gallery. Visual reference: the Media "From our community" fan (LinkedInFan).
/*
  Review 2026-09-30: "for the homepage gallery section - life at the centre
  section on mobile, use the card style used on media - from our community".

  Below md the gallery's wheel gives way to the fan: the front photograph full
  size, its neighbours tilted behind it on either side, and the blue panel over
  its lower part carrying the caption the photograph is filed under. The
  geometry is the shared .fan-* rules in app/globals.css; only the content
  differs from LinkedInFan. There is no Read More, because a gallery frame has
  no destination to send it to. Arrows, a swipe or a side card bring a
  photograph to the front; it does not move on its own.
*/

import Image from "next/image";
import { useRef, useState } from "react";

import type { GalleryPhoto } from "./RadialGallery";

const SWIPE_PX = 48;

export function GalleryFan({ photos, label }: { photos: readonly GalleryPhoto[]; label: string }) {
  const [active, setActive] = useState(0);
  const down = useRef<number | null>(null);
  const count = photos.length;
  const go = (next: number) => setActive((next + count) % count);

  const swipe = (end: number) => {
    const start = down.current;
    down.current = null;
    if (start !== null && Math.abs(end - start) >= SWIPE_PX) go(active + (end < start ? 1 : -1));
  };

  return (
    <div className="fan" data-variant="photo" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        className="fan-stage touch-pan-y"
        onPointerDown={(event) => { down.current = event.clientX; }}
        onPointerUp={(event) => swipe(event.clientX)}
        onPointerCancel={() => { down.current = null; }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(active + 1);
          if (event.key === "ArrowLeft") go(active - 1);
        }}
      >
        {photos.map((photo, index) => {
          // Signed distance from the front card, wrapped so the fan is symmetric.
          let offset = index - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const front = offset === 0;
          return (
            <figure
              key={photo.id}
              className="fan-card"
              data-front={front || undefined}
              style={{ "--offset": offset, "--depth": Math.abs(offset) } as React.CSSProperties}
              aria-hidden={!front}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
            >
              {front ? null : <button type="button" className="fan-pick" tabIndex={-1} onClick={() => setActive(index)} />}
              <div className="fan-photo">
                <Image src={photo.src} alt={photo.alt} fill sizes="80vw" className="object-cover" draggable={false} />
              </div>
              <figcaption className="fan-panel">
                <p className="fan-kicker">{index + 1} / {count}</p>
                <p className="fan-title">{photo.caption}</p>
              </figcaption>
            </figure>
          );
        })}
        {count > 1 ? (
          <>
            <button type="button" className="fan-arrow" data-side="prev" aria-label="Previous photograph" onClick={() => go(active - 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className="fan-arrow" data-side="next" aria-label="Next photograph" onClick={() => go(active + 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
