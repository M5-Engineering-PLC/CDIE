// Section wrapper. Keeps vertical rhythm in one place rather than per page.
/*
  Change request 2026-09-21, section 1: a phone shows half the band. The
  padding is not written here; .band-y in app/globals.css owns it, and the
  token it reads halves below the md breakpoint. Supporting copy folds to three
  lines on a phone via .trim-mobile and is released on a wider screen, so
  nothing is removed from the document.
*/

import type { ReactNode } from "react";

export type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  standfirst?: string;
  tone?: "paper" | "surface";
  children: ReactNode;
};

export function Section({
  id,
  eyebrow,
  title,
  standfirst,
  tone = "paper",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`border-b border-line-soft ${tone === "surface" ? "bg-surface" : ""} scroll-mt-20`}
    >
      <div className="shell band-y">
        {eyebrow || title || standfirst ? (
          <header className="mb-6 max-w-[62ch] md:mb-10">
            {eyebrow ? <p className="kicker">{eyebrow}</p> : null}
            {title ? <h2 className="display mt-3 text-title md:text-head">{title}</h2> : null}
            {standfirst ? (
              <p className="trim-mobile mt-3 text-lead leading-relaxed text-ink-2 md:mt-4">
                {standfirst}
              </p>
            ) : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
