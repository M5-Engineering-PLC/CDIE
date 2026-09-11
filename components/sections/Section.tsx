// Section wrapper. Keeps vertical rhythm in one place rather than per page.

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
      <div className="shell py-14 md:py-20">
        {eyebrow || title || standfirst ? (
          <header className="mb-10 max-w-[62ch]">
            {eyebrow ? <p className="kicker">{eyebrow}</p> : null}
            {title ? <h2 className="display mt-3 text-title md:text-head">{title}</h2> : null}
            {standfirst ? (
              <p className="mt-4 text-lead leading-relaxed text-ink-2">{standfirst}</p>
            ) : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
