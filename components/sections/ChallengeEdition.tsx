// Section. Programmes > Design Challenge, one dated edition: the call and the winning teams.
// Copy: the call CDIE supplied, 2026-09-23. Every fact shown is printed on that call.
/*
  Daily note 2026-09-25: two more uses. The previous challenge (assistive
  care) has no call flyer in the repository, so `call` is optional and the
  facts stand alone. The summer programme page is built "just like design
  challenges", so `label` and `galleryTitle` name the edition and its
  photographs, and `link` points at the post the facts come from.
*/

import Image from "next/image";

type Photo = { src: string; alt: string; width: number; height: number };

export type ChallengeEditionProps = {
  id: string;
  year: string;
  theme: string;
  brief: string;
  facts: readonly { label: string; value: string }[];
  call?: Photo;
  winners: readonly Photo[];
  /** what the edition is called before the year, "Design Challenge" by default */
  label?: string;
  /** heading over the photographs, "Winning teams" by default */
  galleryTitle?: string;
  /** the post the facts are taken from */
  link?: { label: string; href: string };
};

export function ChallengeEdition({
  id, year, theme, brief, facts, call, winners,
  label = "Design Challenge", galleryTitle = "Winning teams", link,
}: ChallengeEditionProps) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line-soft">
      <div className="shell band-y">
        <header className="mb-6 max-w-[62ch] md:mb-10">
          <p className="kicker">{year}</p>
          <h2 className="display mt-3 text-title md:text-head">
            {label} {year}: {theme}
          </h2>
          <p className="mt-3 text-lead leading-relaxed text-ink-2 md:mt-4">{brief}</p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex min-w-0 flex-col gap-6">
            <h3 className="kicker">{call ? "The call" : "The facts"}</h3>
            {call ? (
              <div className="overflow-hidden border border-line bg-raise">
                <Image
                  src={call.src}
                  alt={call.alt}
                  width={call.width}
                  height={call.height}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="h-auto w-full"
                />
              </div>
            ) : null}
            <dl className="grid gap-px border border-line bg-line">
              {facts.map((fact) => (
                <div key={fact.label} className="grid gap-1 bg-surface p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] sm:gap-4">
                  <dt className="text-fine font-semibold text-ink">{fact.label}</dt>
                  <dd className="text-fine leading-relaxed text-ink-2">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {link ? (
              <a href={link.href} target="_blank" rel="noreferrer" className="text-body font-medium text-brand hover:text-brand-live">
                {link.label}
              </a>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <h3 className="kicker">{galleryTitle}</h3>
            <ul className="grid gap-4">
              {winners.map((photo) => (
                <li key={photo.src} className="overflow-hidden border border-line bg-raise">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="h-auto w-full"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
