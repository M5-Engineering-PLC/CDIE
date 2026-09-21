// Change request 2026-09-13, section 4.3. Copy: PROGRAMMES > Programme events.
/*
  A card per event: photograph, date, venue, short description. The date is the
  first thing read, because the only question anyone brings to an events band is
  "has it happened yet".
*/

/*
  Change request 2026-09-21, section 1: a phone shows half the band. A stack of
  cards is the single biggest thing on a long page, so below the md breakpoint
  the list scroll-snaps sideways and the reader sees one card and the edge of
  the next. Above it, the grid it has always been. No JavaScript either side:
  the browser supplies the swipe, the inertia and the keyboard.
*/

import Image from "next/image";

export type EventCardItem = {
  id: string;
  title: string;
  start: string;
  venue: string;
  summary: string;
  image: string;
  alt: string;
};

function formatDate(iso: string) {
  // en-GB and a fixed UTC zone: a date rendered on the server and again on the
  // client must produce the same string, or React reports a hydration mismatch.
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function EventGrid({ items }: { items: EventCardItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="rail -mx-gutter auto-cols-[82%] gap-4 px-gutter md:mx-0 md:grid-flow-row md:auto-cols-auto md:grid-cols-2 md:gap-px md:overflow-visible md:bg-line md:px-0 lg:grid-cols-3">
      {items.map((event) => (
        <li key={event.id} className="flex flex-col border border-line bg-raise md:border-0">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={event.image}
              alt={event.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <p className="kicker">
              <time dateTime={event.start}>{formatDate(event.start)}</time>
            </p>
            <h3 className="display text-sub leading-snug">{event.title}</h3>
            <p className="text-body leading-relaxed text-ink-2">{event.summary}</p>
            <p className="mt-auto pt-3 text-fine text-ink-3">{event.venue}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
