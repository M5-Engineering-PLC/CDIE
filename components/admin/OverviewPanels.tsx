// Dashboard overview panels: subscribers, contact forms by reason and site visitors. Internal tooling.
/*
  Review 2026-09-30: "newsletter card can expand to show the actual
  subscribers", "contact forms by reason card [expands] to show actual email
  and message, classified by reason", "pull visitors analytics from vercel".

  Names, addresses and messages are personal data. They are drawn only when
  sign-in is on (ADMIN_AUTH=on); with the dashboard open to anyone who has the
  link, the panels show counts and say why the details are held back.
*/

import type { EnquiryRecord, Subscription } from "@/lib/admin/store";
import type { VisitorReport } from "@/lib/admin/visitors";

import { MonthBars, StatTile } from "./Analytics";

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const HELD_BACK = "Names, addresses and messages show here once dashboard sign-in is switched on (ADMIN_AUTH=on).";
const box = "border border-line bg-surface";

export function SubscriberPanel({ people, showPeople }: { people: Subscription[]; showPeople: boolean }) {
  const confirmed = people.filter((person) => (person.status ?? "confirmed") === "confirmed");
  return (
    <details className={`${box} group`}>
      <summary className="flex cursor-pointer list-none items-end justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-fine text-ink-3">Newsletter subscribers</span>
          <span className="display mt-2 block text-head tabular-nums text-ink">{confirmed.length}</span>
        </span>
        <span className="text-fine text-brand group-open:hidden">Show</span>
        <span className="hidden text-fine text-brand group-open:inline">Hide</span>
      </summary>
      <div className="border-t border-line-soft p-5 pt-3">
        {!showPeople ? <p className="text-fine text-ink-3">{HELD_BACK}</p> : people.length === 0 ? <p className="text-fine text-ink-3">No sign-ups yet.</p> : (
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {[...people].sort((a, b) => b.at.localeCompare(a.at)).map((person) => (
              <li key={person.email} className="flex flex-wrap justify-between gap-x-3 text-fine">
                <a href={`mailto:${person.email}`} className="text-ink hover:text-brand">{person.email}</a>
                <span className="text-ink-3">{person.status ?? "confirmed"} · {date(person.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

export function EnquiryPanel({ enquiries, showPeople }: { enquiries: EnquiryRecord[]; showPeople: boolean }) {
  const byReason = Object.entries(
    enquiries.reduce<Record<string, EnquiryRecord[]>>((all, entry) => ({ ...all, [entry.reason]: [...(all[entry.reason] ?? []), entry] }), {}),
  ).sort((a, b) => b[1].length - a[1].length);
  if (byReason.length === 0) return null;
  return (
    <div className={`${box} p-5`}>
      <h3 className="text-body font-semibold text-ink">Contact forms by reason</h3>
      {!showPeople ? <p className="mt-1 text-fine text-ink-3">{HELD_BACK}</p> : null}
      <ul className="mt-3 flex flex-col divide-y divide-line-soft">
        {byReason.map(([reason, entries]) => (
          <li key={reason}>
            <details>
              <summary className="flex cursor-pointer justify-between py-2 text-fine text-ink-2">
                <span>{reason}</span>
                <span className="font-mono tabular-nums">{entries.length}</span>
              </summary>
              {showPeople ? (
                <ul className="flex flex-col gap-3 pb-3">
                  {[...entries].sort((a, b) => b.at.localeCompare(a.at)).map((entry) => (
                    <li key={entry.at} className="border-l-2 border-line pl-3 text-fine">
                      <p className="text-ink-3">{date(entry.at)}{entry.name ? ` · ${entry.name}` : ""}</p>
                      {entry.email ? <a href={`mailto:${entry.email}`} className="text-brand">{entry.email}</a> : <p className="text-ink-3">Address not recorded (sent before details were kept).</p>}
                      {entry.message ? <p className="mt-1 whitespace-pre-line text-ink-2">{entry.message}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VisitorPanel({ report }: { report: VisitorReport | string | null }) {
  if (report === null) {
    return <p className={`${box} p-5 text-fine text-ink-3`}>Site visitors appear here once Vercel Web Analytics is on and VERCEL_ANALYTICS_TOKEN and VERCEL_ANALYTICS_PROJECT_ID are set.</p>;
  }
  if (typeof report === "string") return <p className={`${box} p-5 text-fine text-flag-ink`}>{report}</p>;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="grid grid-cols-2 gap-4">
        <StatTile label="Visitors, last 30 days" value={report.visitors} />
        <StatTile label="Page views, last 30 days" value={report.pageviews} />
        <div className={`${box} col-span-2 p-5`}>
          <h3 className="text-body font-semibold text-ink">Most visited pages</h3>
          <ul className="mt-3 flex flex-col gap-1">
            {report.pages.map((page) => (
              <li key={page.path} className="flex justify-between gap-3 text-fine text-ink-2">
                <span className="truncate">{page.path}</span>
                <span className="font-mono tabular-nums">{page.pageviews}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <MonthBars title="Visitors per day, last 14 days" months={report.days} />
    </div>
  );
}
