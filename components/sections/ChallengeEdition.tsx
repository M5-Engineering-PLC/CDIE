// Section. Programmes > Design Challenge, one dated edition: the call and the winning teams.
// Copy: the call CDIE supplied, 2026-09-23. Every fact shown is printed on that call.

import Image from "next/image";

type Photo = { src: string; alt: string; width: number; height: number };

export type ChallengeEditionProps = {
  id: string;
  year: string;
  theme: string;
  brief: string;
  facts: readonly { label: string; value: string }[];
  call: Photo;
  winners: readonly Photo[];
};

export function ChallengeEdition({ id, year, theme, brief, facts, call, winners }: ChallengeEditionProps) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line-soft">
      <div className="shell band-y">
        <header className="mb-6 max-w-[62ch] md:mb-10">
          <p className="kicker">{year}</p>
          <h2 className="display mt-3 text-title md:text-head">
            Design Challenge {year}: {theme}
          </h2>
          <p className="mt-3 text-lead leading-relaxed text-ink-2 md:mt-4">{brief}</p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex min-w-0 flex-col gap-6">
            <h3 className="kicker">The call</h3>
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
            <dl className="grid gap-px border border-line bg-line">
              {facts.map((fact) => (
                <div key={fact.label} className="grid gap-1 bg-surface p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] sm:gap-4">
                  <dt className="text-fine font-semibold text-ink">{fact.label}</dt>
                  <dd className="text-fine leading-relaxed text-ink-2">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <h3 className="kicker">Winning teams</h3>
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
