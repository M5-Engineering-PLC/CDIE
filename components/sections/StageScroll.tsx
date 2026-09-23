"use client";

// Section. Copy: PROGRAMMES > How learning works. Motion reference: the pinned work panels on hugeinc.com.
/*
  Final pass 2026-09-23: "the flow diagram should be scroll-animated: the
  scrolling will stop at this section and animate through the 4 steps to reveal
  them one at a time. Afterwards scrolling continues down the page."

  The band pins (GSAP ScrollTrigger, kept in step with Lenis by SmoothScroll)
  and vertical scroll drives a horizontal track, one stage per stop, snapping
  so a stage is never left half on screen. Each stage arrives with a motion
  that says what the stage is:
  - Understand the need: the picture opens from a point, the way attention
    widens from one observation.
  - Develop a direction: the panel swings round into place, a choice turning
    to face you.
  - Build and learn: the picture is built up from the base.
  - Explain your thinking: the words light up one after another, as if spoken.

  With reduced motion it is a plain grid with nothing pinned or hidden.
  The geometry is .stage-* in app/globals.css.
*/

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ScrollStage = { id: string; title: string; body: string; image: { src: string; alt: string } };

type Entrance = (panel: HTMLElement) => gsap.core.Timeline;

const entrances: Entrance[] = [
  (panel) => gsap.timeline()
    .fromTo(panel.querySelector(".stage-photo"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", ease: "power2.out" })
    .from(panel.querySelectorAll(".stage-copy > *"), { y: 40, opacity: 0, stagger: 0.12 }, "<0.2"),
  (panel) => gsap.timeline()
    .fromTo(panel, { rotateY: -38, opacity: 0.2, transformOrigin: "0% 50%" }, { rotateY: 0, opacity: 1, ease: "power3.out" })
    .from(panel.querySelector(".stage-photo img"), { scale: 1.35 }, "<"),
  (panel) => gsap.timeline()
    .fromTo(panel.querySelector(".stage-photo"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut" })
    .from(panel.querySelectorAll(".stage-copy > *"), { x: 60, opacity: 0, stagger: 0.1 }, "<0.3"),
  (panel) => gsap.timeline()
    .from(panel.querySelector(".stage-photo"), { y: 80, scale: 0.9, opacity: 0 })
    .fromTo(panel.querySelectorAll(".stage-word"), { opacity: 0.12 }, { opacity: 1, stagger: 0.05, ease: "none" }, "<0.1"),
];

export function StageScroll({ eyebrow, title, standfirst, stages }: {
  eyebrow: string; title: string; standfirst?: string; stages: readonly ScrollStage[];
}) {
  const band = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = band.current;
    const list = track.current;
    if (!section || !list) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      section.dataset.pinned = "on";
      const panels = [...list.children] as HTMLElement[];
      const distance = () => list.scrollWidth - section.clientWidth;
      const slide = gsap.to(list, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance() * 1.15}`,
          pin: true,
          scrub: 0.6,
          snap: { snapTo: 1 / (panels.length - 1), duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut" },
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.round(self.progress * (panels.length - 1))),
        },
      });
      panels.forEach((panel, index) => {
        const entrance = entrances[index % entrances.length](panel);
        ScrollTrigger.create({
          animation: entrance,
          scrub: 0.5,
          ...(index === 0
            ? { trigger: section, start: "top 75%", end: "top top" }
            : { trigger: panel, containerAnimation: slide, start: "left 95%", end: "center 55%" }),
        });
      });
      return () => { delete section.dataset.pinned; };
    });
    return () => media.revert();
  }, [stages.length]);

  return (
    <section ref={band} aria-label={eyebrow} className="stage-band">
      <header className="shell stage-head">
        <p className="kicker">{eyebrow}</p>
        <h2 className="display mt-3 text-title md:text-head">{title}</h2>
        {standfirst ? <p className="mt-3 max-w-[62ch] text-lead leading-relaxed text-ink-2">{standfirst}</p> : null}
      </header>
      <ol ref={track} className="stage-track">
        {stages.map((stage, index) => (
          <li key={stage.id} className="stage-panel" aria-current={index === active ? "step" : undefined}>
            <div className="stage-photo">
              <Image src={stage.image.src} alt={stage.image.alt} fill sizes="(max-width: 768px) 86vw, 34rem" className="object-cover" />
            </div>
            <div className="stage-copy">
              <p className="stage-count">{String(index + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}</p>
              <h3 className="display text-title md:text-head">{stage.title}</h3>
              <p className="text-lead leading-relaxed text-ink-2">
                {stage.body.split(" ").map((word, at) => <span key={at} className="stage-word">{word} </span>)}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="stage-progress" aria-hidden="true">
        {stages.map((stage, index) => (
          <span key={stage.id} className={index <= active ? "is-on" : undefined}>{stage.title.replace(/\.$/, "")}</span>
        ))}
      </div>
    </section>
  );
}
