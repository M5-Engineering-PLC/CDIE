"use client";

// Lucid: Programmes learning model. Copy: PROGRAMMES > How learning works.
// Interaction reference: the hover-expanding panels in the supplied recording.
/*
  Review 2026-09-30: "the opening of the accordion should depend on scroll, not
  tap alone", pinned while the four stages play through, then released.

  The band sits sticky inside .stage-scroll, a wrapper taller than the screen
  by one stretch of scrolling per stage (app/globals.css). How far the reader
  has scrolled through that wrapper picks the open stage, so the page holds
  still while the stages open in turn and moves on after the last. It is CSS
  sticky rather than a scripted pin, so it runs on the page's own scroll and
  Lenis needs no part in it. A hover, tap or focus still opens a stage, and
  holds until the scroll crosses into another stage's stretch. On a screen too
  short to hold the band the wrapper is released and the band scrolls normally.
*/

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type LearningStagePanel = {
  id: string;
  title: string;
  body: string;
  image: { src: string; alt: string };
};

export function StageAccordion({ eyebrow, title, standfirst, stages }: {
  eyebrow: string;
  title: string;
  standfirst?: string;
  stages: readonly LearningStagePanel[];
}) {
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const count = stages.length;

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    let frame = 0;
    let last = -1;
    const read = () => {
      frame = 0;
      const band = node.firstElementChild as HTMLElement | null;
      if (!band || getComputedStyle(band).position !== "sticky") return;
      // 0 as the band sticks under the bar, 1 as the wrapper's end releases it.
      const box = node.getBoundingClientRect();
      const travel = box.height - band.offsetHeight;
      if (travel <= 0) return;
      const pinTop = Number.parseFloat(getComputedStyle(band).top) || 0;
      const progress = Math.min(Math.max((pinTop - box.top) / travel, 0), 0.9999);
      const stage = Math.floor(progress * count);
      if (stage !== last) { last = stage; setActive(stage); }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  return (
    <div ref={scroller} className="stage-scroll" style={{ "--stage-count": count } as React.CSSProperties}>
      <section aria-label={eyebrow} className="stage-band">
        <header className="shell stage-head">
          <p className="kicker">{eyebrow}</p>
          <h2 className="display mt-3 text-title md:text-head">{title}</h2>
          {standfirst ? <p className="mt-3 max-w-[62ch] text-lead leading-relaxed text-ink-2">{standfirst}</p> : null}
        </header>
        <ol className="stage-track">
          {stages.map((stage, index) => {
            const isActive = index === active;
            return (
              <li key={stage.id} className="stage-panel" data-active={isActive}>
                <div className="stage-photo" aria-hidden="true">
                  <Image
                    src={stage.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 900px) 70vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="stage-shade" aria-hidden="true" />
                <div className="stage-closed" aria-hidden={isActive}>
                  <span className="stage-count">{String(index + 1).padStart(2, "0")}</span>
                  <span className="stage-closed-title">{stage.title}</span>
                </div>
                <div className="stage-copy" aria-hidden={!isActive}>
                  <p className="stage-count">{String(index + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}</p>
                  <h3 className="display stage-title">{stage.title}</h3>
                  <p className="stage-body">{stage.body}</p>
                </div>
                <button
                  type="button"
                  className="stage-pick"
                  aria-label={`Show stage ${index + 1}: ${stage.title}`}
                  aria-expanded={isActive}
                  onPointerMove={(event) => {
                    if ((event.pointerType === "mouse" || event.pointerType === "pen") &&
                      (event.movementX !== 0 || event.movementY !== 0)) setActive(index);
                  }}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                />
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
