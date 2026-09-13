// Change request 2026-09-13, section 4.4. One FAQ pattern for Programmes,
// Design Studio and Media, replacing three copies of the same flat list.
/*
  Built on <details>/<summary>, not React state, for three reasons: it opens
  without JavaScript, it is keyboard-operable and screen-reader-announced with
  no ARIA of our own, and it keeps this a server component.

  The first question is open on load so the section never reads as an empty
  stack of bars.
*/

import type { Faq } from "@/content/types";

export type FaqListProps = {
  items: Faq[];
  /** Opens the first question. Set false where the section is already long. */
  openFirst?: boolean;
};

export function FaqList({ items, openFirst = true }: FaqListProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-px bg-line">
      {items.map((faq, index) => (
        <details
          key={faq.id}
          name="faq"
          open={openFirst && index === 0}
          className="group bg-raise open:bg-surface"
        >
          <summary
            className="flex cursor-pointer list-none items-start justify-between gap-6 p-6 text-lead text-ink transition-colors hover:text-brand [&::-webkit-details-marker]:hidden"
          >
            {faq.question}
            {/*
              A rotating plus, drawn rather than typed: a glyph like + or ▾
              inherits the font's metrics and sits off-centre against the
              question's cap height.
            */}
            <span
              aria-hidden="true"
              className="relative mt-2 block h-3 w-3 shrink-0 text-brand"
            >
              <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-current" />
              <span className="absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-200 group-open:rotate-90 group-open:opacity-0" />
            </span>
          </summary>
          <p className="max-w-[64ch] px-6 pb-6 text-body leading-relaxed text-ink-2">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
