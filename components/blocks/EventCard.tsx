// Block. Lucid: Media > Events Calendar. One calendar card, after gt-world-challenge.com/calendar.
/*
  Photograph on top; the date block overlaps its lower edge with the start
  and, where the event runs longer than a day, the end; the event type as a
  tag; the title; the venue, or the programme line; and a Read More button (2026-09-24)
  that opens the post the record comes from. A date the source only estimates
  says so. Images are plain img because some are LinkedIn URLs.
*/

export type CalendarCardEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  kind?: string;
  venue?: string;
  estimated?: boolean;
  link?: string;
  image?: string;
};

const parts = (iso: string) => {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return {
    day: date.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" }),
    month: date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }).toUpperCase(),
    year: date.toLocaleDateString("en-GB", { year: "numeric", timeZone: "UTC" }),
  };
};

function DateBlock({ iso }: { iso: string }) {
  const { day, month, year } = parts(iso);
  return (
    <span className="cal-date-part">
      <span className="cal-date-day">{day}</span>
      <span className="cal-date-month">{month}</span>
      <span className="cal-date-year">{year}</span>
    </span>
  );
}

export function EventCard({ event, today, fallbackImage, focusable = true }: {
  event: CalendarCardEvent; today: string; fallbackImage: string; focusable?: boolean;
}) {
  const multiDay = event.end && event.end.slice(0, 10) !== event.start.slice(0, 10);
  const upcoming = event.start > today;
  return (
    <article className="cal-card">
      <div className="cal-photo">
        {/* eslint-disable-next-line @next/next/no-img-element -- some pictures come from LinkedIn */}
        <img src={event.image ?? fallbackImage} alt="" loading="lazy" data-mark={!event.image || undefined} />
      </div>
      <div className="cal-top">
        <p className="cal-date" aria-label={`${event.start}${multiDay ? ` to ${event.end}` : ""}`}>
          <DateBlock iso={event.start} />
          {multiDay ? <><span className="cal-date-dash" aria-hidden="true" /><DateBlock iso={event.end as string} /></> : null}
        </p>
        <span className="cal-tag" data-upcoming={upcoming || undefined}>{upcoming ? "Upcoming" : event.kind ?? "Event"}</span>
      </div>
      <div className="cal-details">
        <h3 className="cal-title">{event.title}</h3>
        {event.venue || (upcoming && event.kind) ? <p className="cal-sub">{event.venue ?? event.kind}</p> : null}
      </div>
      <div className="cal-footer">
        {event.link ? (
          <a href={event.link} target="_blank" rel="noreferrer" tabIndex={focusable ? 0 : -1} className="cal-more">
            Read More<span className="sr-only"> for {event.title} (opens in a new tab)</span>
          </a>
        ) : (
          <span>CDIE event</span>
        )}
      </div>
    </article>
  );
}
