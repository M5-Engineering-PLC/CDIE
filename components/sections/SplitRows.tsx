// Lucid: Programmes > Invention Education, The approach. Copy: the page's body paragraphs.
/*
  2026-09-24: "use the full screen width with alternating text on the left
  image on the right subsections". Each paragraph gets a row the width of the
  window: words on one half, a photograph filling the other. The first row
  starts words-left, and the sides swap row by row. On a phone the photograph
  sits under its paragraph.
*/

import Image from "next/image";

export type SplitRow = {
  text: string;
  image: { src: string; alt: string };
};

export function SplitRows({ eyebrow, title, rows }: { eyebrow: string; title: string; rows: readonly SplitRow[] }) {
  return (
    <section aria-label={eyebrow} className="border-b border-line-soft">
      <header className="shell band-y pb-0">
        <p className="kicker">{eyebrow}</p>
        <h2 className="display mt-3 text-title md:text-head">{title}</h2>
      </header>
      <div className="mt-8 flex flex-col md:mt-12">
        {rows.map((row, index) => (
          <div key={row.image.src} className="grid md:grid-cols-2">
            <div className={`flex items-center px-gutter py-8 md:px-16 md:py-14 ${index % 2 === 1 ? "md:order-2" : ""}`}>
              <p className="max-w-[56ch] text-lead leading-relaxed text-ink-2">{row.text}</p>
            </div>
            <div className="relative min-h-64 bg-raise md:min-h-[26rem]">
              <Image src={row.image.src} alt={row.image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
