// Lucid: Media > Events Calendar. Copy: MEDIA. Programmes owns every event record.
/*
  Enhancements 2026-09-22 (second round): "populate events with the last 6
  months and upcoming 3 months, use gantt chart instead of timeline format".

  One row per event on a shared month scale that runs from six months before
  today to three months after it, with a line at today. Each row keeps its
  title and date above the bar, so nothing depends on fitting words inside a
  bar: the chart fits a phone with no sideways scroll. Past bars are muted,
  upcoming ones are brand. An estimated date says so.
*/

export type GanttEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  kind?: string;
  estimated?: boolean;
  link?: string;
};

const DAY = 86_400_000;
const SHORT = { day: "numeric", month: "short", timeZone: "UTC" } as const;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", SHORT);

export function EventGantt({ items, from, to, today }: { items: GanttEvent[]; from: string; to: string; today: string }) {
  const start = Date.parse(from);
  const span = Date.parse(to) - start;
  const at = (iso: string) => Math.min(100, Math.max(0, ((Date.parse(iso) - start) / span) * 100));
  const rows = items
    .filter((event) => (event.end ?? event.start) >= from && event.start <= to)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  const months: { key: string; left: number; label: string }[] = [];
  const cursor = new Date(from);
  cursor.setUTCDate(1);
  while (cursor.getTime() <= Date.parse(to)) {
    const iso = cursor.toISOString().slice(0, 10);
    if (iso >= from) months.push({ key: iso, left: at(iso), label: cursor.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }) });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const now = at(today);

  return (
    <div>
      <div aria-hidden="true" className="relative h-6 border-b border-line">
        {months.map((month) => (
          <span key={month.key} className="kicker absolute top-0 -translate-x-1/2 text-[0.625rem] sm:text-fine" style={{ left: `${month.left}%` }}>
            {month.label}
          </span>
        ))}
        <span className="absolute -bottom-px h-2 border-l-2 border-brand-live" style={{ left: `${now}%` }} />
        <span className="absolute top-0 -translate-x-1/2 bg-brand-live px-1 font-mono text-[0.625rem] uppercase leading-4 text-surface" style={{ left: `${now}%` }}>
          Today
        </span>
      </div>
      <div className="relative">
        {months.map((month) => (
          <span key={month.key} aria-hidden="true" className="absolute inset-y-0 border-l border-line-soft" style={{ left: `${month.left}%` }} />
        ))}
        <ol className="relative flex flex-col">
          {rows.map((event) => {
            const left = at(event.start);
            const width = Math.max(at(event.end ?? event.start) - left + (DAY / span) * 100, 0.9);
            const past = (event.end ?? event.start) < today;
            const date = `${event.estimated ? "c. " : ""}${event.end ? `${day(event.start)} – ${day(event.end)}` : day(event.start)}`;
            return (
              <li key={event.id} className="border-b border-line-soft py-2.5">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pr-2">
                  {event.link ? (
                    <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-body font-medium text-ink transition-colors hover:text-brand">
                      {event.title}
                    </a>
                  ) : (
                    <span className="text-body font-medium text-ink">{event.title}</span>
                  )}
                  <time dateTime={event.start} className="font-mono text-fine text-ink-3">{date}</time>
                  {event.kind ? <span className="hidden text-fine text-ink-3 sm:inline">{event.kind}</span> : null}
                </p>
                <div className="relative mt-1.5 h-2.5">
                  <span aria-hidden="true" className="absolute -inset-y-1 border-l-2 border-brand-live/70" style={{ left: `${now}%` }} />
                  <span
                    className={`absolute inset-y-0 rounded-full ${past ? "bg-ink-3/60" : "bg-brand"}`}
                    style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      {rows.every((event) => (event.end ?? event.start) < today) ? (
        <p className="mt-4 text-fine text-ink-3">No upcoming events are confirmed yet. New ones appear here as they are announced.</p>
      ) : null}
    </div>
  );
}
