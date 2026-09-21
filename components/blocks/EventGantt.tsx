// Lucid: Media > Events Calendar. Copy: MEDIA. Programmes owns every event record.
/*
  Change request 2026-09-21, section 5: "populate the proper calendar of recent
  events ... the gantt style calendar", "Events calendar (simplified, could be
  gantt chart style)".

  One row per event, laid on a shared month scale, so the shape of a term is
  readable at a glance: what overlaps, what is a single day, what runs for a
  fortnight. A single-day event still gets a visible bar, because a
  zero-width mark is a rendering accident rather than a design.

  Simplified means three things are deliberately absent: no week or day
  gridlines, no dependencies between bars, and no drag. This is a calendar a
  reader looks at, not a plan anyone edits.

  The scale is derived from the records, never assumed: the axis runs from the
  month of the earliest event to the month of the latest. An empty list renders
  nothing and the page shows its own empty state, because a calendar drawn
  around no events would imply a period in which nothing is happening, which is
  a claim the sources do not make.
*/

export type GanttEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  venue?: string;
};

const MONTH = { month: "short", timeZone: "UTC" } as const;
const FULL = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" } as const;

/** Whole months between two dates, so bar offsets and widths share one unit. */
function monthIndex(iso: string) {
  const date = new Date(iso);
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

/** Position within the scale, in months, including the fraction of the month. */
function position(iso: string, from: number) {
  const date = new Date(iso);
  const days = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  return monthIndex(iso) - from + (date.getUTCDate() - 1) / days;
}

function label(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", FULL);
}

export function EventGantt({ items }: { items: GanttEvent[] }) {
  if (items.length === 0) return null;

  const ordered = [...items].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const from = Math.min(...ordered.map((item) => monthIndex(item.start)));
  const to = Math.max(...ordered.map((item) => monthIndex(item.end ?? item.start)));
  const months = Array.from({ length: to - from + 1 }, (_, offset) => {
    const index = from + offset;
    return new Date(Date.UTC(Math.floor(index / 12), index % 12, 1));
  });
  const span = months.length;

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div className="min-w-[36rem]">
        <div
          aria-hidden="true"
          className="grid border-b border-line pb-2"
          style={{ gridTemplateColumns: `repeat(${span}, minmax(0, 1fr))` }}
        >
          {months.map((month) => (
            <span key={month.toISOString()} className="kicker border-l border-line-soft pl-2 first:border-l-0">
              {month.toLocaleDateString("en-GB", MONTH)}
            </span>
          ))}
        </div>

        <ol className="flex flex-col">
          {ordered.map((event) => {
            const start = position(event.start, from);
            const finish = event.end ? position(event.end, from) : start;
            // A single day would be a hairline, so every bar keeps a floor.
            const width = Math.max(finish - start + 0.12, 0.34);

            return (
              <li key={event.id} className="border-b border-line-soft py-3">
                <div className="relative h-7" style={{ marginInline: 0 }}>
                  <div
                    className="absolute top-0 flex h-7 items-center rounded-edge bg-brand px-2"
                    style={{
                      left: `${(start / span) * 100}%`,
                      width: `${Math.min(width / span, 1 - start / span) * 100}%`,
                    }}
                  >
                    <span className="sr-only">
                      {event.end ? `${label(event.start)} to ${label(event.end)}` : label(event.start)}
                    </span>
                  </div>
                </div>
                <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-body font-medium text-ink">{event.title}</span>
                  <time dateTime={event.start} className="font-mono text-fine text-ink-3">
                    {event.end ? `${label(event.start)} – ${label(event.end)}` : label(event.start)}
                  </time>
                  {event.venue ? <span className="text-fine text-ink-3">{event.venue}</span> : null}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
