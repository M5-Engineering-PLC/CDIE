// Lucid: Media > Events Calendar. Copy: MEDIA. Programmes owns every event record.
/*
  Enhancements 2026-09-22: "only maintain a timeline in the media page".

  The gantt band is replaced by one chronological timeline. It replaced a
  canvas that forced a 36rem minimum width on phones, so dates and titles ran
  off the screen; a vertical line with one stop per event fits every width
  without sideways scrolling. Events are grouped under their month so the shape
  of a term still reads at a glance, and anything already past is quieter than
  what is coming, without being hidden.

  An empty list renders nothing and the page shows its own empty state.
*/

export type TimelineEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  venue?: string;
  summary?: string;
  /** "event" or "activity"; shown as a small label */
  kind?: string;
};

const MONTH = { month: "long", year: "numeric", timeZone: "UTC" } as const;
const DAY = { day: "numeric", month: "short", timeZone: "UTC" } as const;

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", DAY);

export function EventTimeline({ items, today }: { items: TimelineEvent[]; today: string }) {
  if (items.length === 0) return null;

  const ordered = [...items].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const groups = new Map<string, TimelineEvent[]>();
  for (const event of ordered) {
    const key = new Date(event.start).toLocaleDateString("en-GB", MONTH);
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }

  return (
    <ol className="flex flex-col gap-8">
      {[...groups].map(([month, events]) => (
        <li key={month}>
          <h3 className="kicker">{month}</h3>
          <ol className="mt-3 border-l-2 border-line">
            {events.map((event) => {
              const past = (event.end ?? event.start) < today;
              return (
                <li key={event.id} className={`relative py-3 pl-6 ${past ? "opacity-60" : ""}`}>
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[7px] top-5 h-3 w-3 rounded-full border-2 border-surface ${past ? "bg-ink-3" : "bg-brand"}`}
                  />
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <time dateTime={event.start} className="font-mono text-fine text-brand">
                      {event.end ? `${day(event.start)} – ${day(event.end)}` : day(event.start)}
                    </time>
                    {event.kind ? (
                      <span className="font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">{event.kind}</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-body font-medium text-ink">{event.title}</p>
                  {event.venue ? <p className="text-fine text-ink-3">{event.venue}</p> : null}
                  {event.summary ? <p className="mt-1 max-w-[60ch] text-body text-ink-2">{event.summary}</p> : null}
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}
