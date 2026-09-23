// Admin dashboard overview: analytics and content counts. Internal tooling, not a website surface.

import Link from "next/link";

import { MonthBars, StatTile } from "@/components/admin/Analytics";
import { collections } from "@/lib/admin/collections";
import { listItems, readAnalytics } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;


const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString();

function lastMonths(dates: string[], count = 6) {
  const now = new Date();
  return Array.from({ length: count }, (_, offset) => {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - offset), 1));
    const key = month.toISOString().slice(0, 7);
    return {
      label: month.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
      value: dates.filter((date) => date.startsWith(key)).length,
    };
  });
}

export default async function AdminOverviewPage() {
  const { subscriptions, enquiries } = await readAnalytics();
  const counts = await Promise.all(collections.map(async (item) => (await listItems(item.id)).length));
  const since = daysAgo(30);
  const reasons = Object.entries(
    enquiries.reduce<Record<string, number>>((all, entry) => ({ ...all, [entry.reason]: (all[entry.reason] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-6 md:p-10">
      <h1 className="text-head text-ink">Dashboard</h1>

      <section className="flex flex-col gap-4">
        <h2 className="kicker">Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Newsletter subscribers" value={subscriptions.length} />
          <StatTile label="New subscribers, last 30 days" value={subscriptions.filter((s) => s.at >= since).length} />
          <StatTile label="Contact forms filled" value={enquiries.length} />
          <StatTile label="Contact forms, last 30 days" value={enquiries.filter((e) => e.at >= since).length} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <MonthBars title="Newsletter subscriptions by month" months={lastMonths(subscriptions.map((s) => s.at))} />
          <MonthBars title="Contact forms by month" months={lastMonths(enquiries.map((e) => e.at))} />
        </div>
        {reasons.length > 0 ? (
          <div className="border border-line bg-surface p-5">
            <h3 className="text-body font-semibold text-ink">Contact forms by reason</h3>
            <ul className="mt-3 flex flex-col gap-1">
              {reasons.map(([reason, count]) => (
                <li key={reason} className="flex justify-between text-fine text-ink-2">
                  <span>{reason}</span>
                  <span className="font-mono tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="kicker">Content</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <li key={collection.id}>
              <Link href={`/admin/${collection.id}`} className="flex items-baseline justify-between border border-line bg-surface px-4 py-3 transition-colors hover:border-brand">
                <span className="text-body text-ink">{collection.label}</span>
                <span className="font-mono text-fine tabular-nums text-ink-3">{counts[index]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}
