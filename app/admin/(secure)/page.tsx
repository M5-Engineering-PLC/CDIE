// Admin dashboard overview: visitors, analytics and content counts. Internal tooling, not a website surface.
/*
  Review 2026-09-30: the Google Sheet and GitHub status notes are gone; the
  newsletter and contact-form panels open to show the people behind the
  numbers; the "last 30 days" tiles are withdrawn; site visitors come from
  Vercel Web Analytics; and the content counts are what is on the website now,
  the site's own records included, for the collections the dashboard manages.
*/

import Link from "next/link";

import { MonthBars, StatTile } from "@/components/admin/Analytics";
import { EnquiryPanel, SubscriberPanel, VisitorPanel } from "@/components/admin/OverviewPanels";
import { AUTH_ENABLED } from "@/lib/admin/auth";
import { currentItems } from "@/lib/admin/builtins";
import { dashboardCollections } from "@/lib/admin/collections";
import { readAnalytics } from "@/lib/admin/store";
import { readVisitors } from "@/lib/admin/visitors";

export const dynamic = "force-dynamic";

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
  const [{ subscriptions, enquiries }, visitors, current] = await Promise.all([
    readAnalytics(),
    readVisitors(),
    Promise.all(dashboardCollections.map((item) => currentItems(item.id))),
  ]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-6 md:p-10">
      <h1 className="sr-only">Dashboard overview</h1>
      <section className="flex flex-col gap-4">
        <h2 className="kicker">Site visitors</h2>
        <VisitorPanel report={visitors} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="kicker">Analytics</h2>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <SubscriberPanel people={subscriptions} showPeople={AUTH_ENABLED} />
          <StatTile label="Contact forms filled" value={enquiries.length} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <MonthBars title="Newsletter subscriptions by month" months={lastMonths(subscriptions.map((s) => s.at))} />
          <MonthBars title="Contact forms by month" months={lastMonths(enquiries.map((e) => e.at))} />
        </div>
        <EnquiryPanel enquiries={enquiries} showPeople={AUTH_ENABLED} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="kicker">On the website now</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCollections.map((collection, index) => (
            <li key={collection.id}>
              <Link href={`/admin/${collection.id}`} className="flex items-baseline justify-between border border-line bg-surface px-4 py-3 transition-colors hover:border-brand">
                <span className="text-body text-ink">{collection.label}</span>
                <span className="font-mono text-fine tabular-nums text-ink-3">{current[index].shown.length + current[index].saved.length}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
