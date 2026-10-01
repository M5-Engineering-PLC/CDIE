"use client";

// Lucid: Programmes learning model. Copy: PROGRAMMES > How learning works.
// Interaction reference: the hover-expanding panels in the supplied recording.

import Image from "next/image";
import { useState } from "react";

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

  return (
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
  );
}
