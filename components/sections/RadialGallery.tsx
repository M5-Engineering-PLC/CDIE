"use client";

// Section. Copy: HOME > Gallery. Motion reference: the radial card marquee on hugeinc.com.
/*
  Final pass 2026-09-23: "Gallery should be placed immediately after the hero.
  The images will be in cards arranged as a circular slider as seen in Huge".

  Revised the same day: "images should be larger and independent of the
  scrolling feature. Ensure the images fill the screen similar to Huge. The
  carousel should rotate automatically and endlessly, not influenced by the
  user scrolling."

  Every card is turned about a point far below the band (transform-origin
  50% var(--radius)), so the cards lie on the rim of a wheel larger than the
  screen and only its top arc shows. The wheel turns on its own clock: each
  frame advances an angle, and each card's place on the rim is that angle plus
  its own step, wrapped so a card leaving on the left comes back round on the
  right, below the fold, where the jump cannot be seen. Scrolling does nothing
  to it. It stops ticking while off screen or in a background tab.

  With reduced motion, or before the script runs, the same cards are a plain
  swipeable row. The geometry is .radial-* in app/globals.css.
*/

import Image from "next/image";
import { useEffect, useRef } from "react";

export type GalleryPhoto = { id: string; src: string; alt: string; caption: string };

/** Seconds for the wheel to carry one card across one step. */
const SECONDS_PER_CARD = 3.2;

export function RadialGallery({ eyebrow, title, photos }: { eyebrow: string; title: string; photos: readonly GalleryPhoto[] }) {
  const band = useRef<HTMLElement>(null);
  const wheel = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const section = band.current;
    const list = wheel.current;
    if (!section || !list || photos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    section.dataset.wheel = "on";
    const cards = [...list.children] as HTMLElement[];
    const step = () => Number.parseFloat(getComputedStyle(list).getPropertyValue("--step")) || 18;
    let turn = 0;
    let last = 0;
    let visible = true;
    let frame = 0;

    const place = () => {
      const s = step();
      const span = s * cards.length;
      cards.forEach((card, index) => {
        // Position on the rim, wrapped into (-span/2, span/2] so the loop is endless.
        let angle = (((index * s - turn) % span) + span) % span;
        if (angle > span / 2) angle -= span;
        card.style.transform = `rotate(${angle}deg)`;
        card.style.setProperty("--near", String(Math.max(0, 1 - Math.abs(angle) / (s * 2))));
        card.style.visibility = Math.abs(angle) > s * 3.2 ? "hidden" : "visible";
      });
    };

    const tick = (time: number) => {
      if (last && visible && !document.hidden) turn += (Math.min(time - last, 64) / 1000) * (step() / SECONDS_PER_CARD);
      last = time;
      place();
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "100px" });
    observer.observe(section);
    place();
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      delete section.dataset.wheel;
      cards.forEach((card) => { card.style.transform = ""; card.style.visibility = ""; card.style.removeProperty("--near"); });
    };
  }, [photos.length]);

  return (
    <section ref={band} aria-label={eyebrow} className="radial-band border-b border-line-soft bg-surface">
      <div className="shell radial-intro">
        <p className="kicker">{eyebrow}</p>
        <h2 className="display mt-3 text-title md:text-head">{title}</h2>
      </div>
      <div className="radial-stage">
        <ul ref={wheel} className="radial-wheel">
          {photos.map((photo) => (
            <li key={photo.id} className="radial-card">
              <figure>
                <div className="radial-photo">
                  <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 80vw, 40vw" className="object-cover" />
                </div>
                <figcaption>{photo.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
