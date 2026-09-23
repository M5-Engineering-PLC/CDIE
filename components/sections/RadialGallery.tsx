"use client";

// Section. Copy: HOME > Gallery. Motion reference: the radial card marquee on hugeinc.com.
/*
  Final pass 2026-09-23: "Gallery should be placed immediately after the hero.
  The images will be in cards arranged as a circular slider as seen in Huge".

  How the reference works, and how this does the same: every card sits in the
  same grid cell and is rotated a fixed step about a point far below the band
  (transform-origin 50% var(--radius)), so the cards lie on the rim of a wheel
  much larger than the screen and only its top arc shows. The band pins while
  the reader scrolls and the wheel turns under them, carrying each card across
  the arc; the card at the crown is at full size and the rest ease back.

  With reduced motion, or before the script runs, the same cards are a plain
  swipeable row. The geometry is .radial-* in app/globals.css.
*/

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type GalleryPhoto = { id: string; src: string; alt: string; caption: string };

export function RadialGallery({ eyebrow, title, photos }: { eyebrow: string; title: string; photos: readonly GalleryPhoto[] }) {
  const band = useRef<HTMLElement>(null);
  const wheel = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const section = band.current;
    const list = wheel.current;
    if (!section || !list || photos.length < 2) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      section.dataset.wheel = "on";
      const cards = [...list.children] as HTMLElement[];
      const step = () => Number.parseFloat(getComputedStyle(list).getPropertyValue("--step")) || 14;
      /* Card i sits at step * i. Turning the wheel from +1 step to -(n - 1)
         steps brings each card over the crown in turn, the last one included. */
      const settle = (turn: number) => {
        cards.forEach((card, index) => {
          const off = Math.min(Math.abs(turn + step() * index) / step(), 2);
          card.style.setProperty("--near", String(1 - off / 2));
        });
      };
      const state = { turn: step() };
      settle(state.turn);
      const tween = gsap.to(state, {
        turn: () => -step() * (photos.length - 1),
        ease: "none",
        onUpdate: () => {
          list.style.transform = `rotate(${state.turn}deg)`;
          settle(state.turn);
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * photos.length * 0.45}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        delete section.dataset.wheel;
        list.style.transform = "";
      };
    });
    return () => media.revert();
  }, [photos.length]);

  return (
    <section ref={band} aria-label={eyebrow} className="radial-band border-b border-line-soft bg-surface">
      <div className="shell radial-intro">
        <p className="kicker">{eyebrow}</p>
        <h2 className="display mt-3 text-title md:text-head">{title}</h2>
      </div>
      <div className="radial-stage">
        <ul ref={wheel} className="radial-wheel">
          {photos.map((photo, index) => (
            <li key={photo.id} className="radial-card" style={{ "--card": index } as React.CSSProperties}>
              <figure>
                <div className="radial-photo">
                  <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 60vw, 22rem" className="object-cover" />
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
