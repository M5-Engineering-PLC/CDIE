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
  no destination to send it to.

  Follow-up the same day: "make it automatic scroll, remove the arrows". The
  fan brings the next photograph forward on its own. A swipe or a tap on a
  side card still chooses one, and the clock restarts from that choice. It
  holds while a finger is on it or it has keyboard focus (arrow keys move it
  then), off screen, in a background tab, and not at all under reduced motion.
*/

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import type { GalleryPhoto } from "./RadialGallery";

const SWIPE_PX = 48;
const ADVANCE_MS = 4500;

export function GalleryFan({ photos, label }: { photos: readonly GalleryPhoto[]; label: string }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const down = useRef<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const count = photos.length;
  const go = (next: number) => setActive((next + count) % count);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (still || held || !onScreen || count < 2) return;
    const timer = window.setTimeout(() => { if (!document.hidden) setActive((active + 1) % count); }, ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [active, count, held, onScreen, still]);

  const swipe = (end: number) => {
    const start = down.current;
    down.current = null;
    if (start !== null && Math.abs(end - start) >= SWIPE_PX) go(active + (end < start ? 1 : -1));
  };

  return (
    <div className="fan" data-variant="photo" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={stage}
        tabIndex={0}
        aria-label={`${label}: use the arrow keys to move between photographs`}
        className="fan-stage touch-pan-y"
        onPointerDown={(event) => { down.current = event.clientX; setHeld(true); }}
        onPointerUp={(event) => { swipe(event.clientX); setHeld(false); }}
        onPointerCancel={() => { down.current = null; setHeld(false); }}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
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
      </div>
    </div>
  );
}
