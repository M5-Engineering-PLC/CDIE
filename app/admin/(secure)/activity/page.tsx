// Source: Fix plan 2026-10-11, D4. Private activity records, filtered by person and section.
import { latestActivity } from "@/lib/admin/audit";
import { AUTH_ENABLED, requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function ActivityPage(props: PageProps<"/admin/activity">) {
  await requireAdmin();
  const query = await props.searchParams;
  const who = AUTH_ENABLED && typeof query.who === "string" ? query.who : "";
  const section = typeof query.section === "string" ? query.section : "";
  let entries: Awaited<ReturnType<typeof latestActivity>>;
  try { entries = await latestActivity(who, section); }
  catch { return <main className="mx-auto flex max-w-6xl flex-col gap-4 p-6"><h1 className="text-head text-ink">Activity</h1><p role="alert" className="text-fine text-brand">The activity log did not answer. Reload the page in a moment.</p></main>; }
  return <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-10">
    <h1 className="text-head text-ink">Activity</h1>
    <form className="flex flex-wrap items-end gap-3">
      {AUTH_ENABLED ? <label className="flex flex-col gap-1 text-fine text-ink-2">Person<input name="who" defaultValue={who} type="text" className="border border-line bg-surface px-3 py-2 text-body text-ink" /></label> : <p className="text-fine text-ink-3">Sign-in is off. Person details stay private.</p>}
      <label className="flex flex-col gap-1 text-fine text-ink-2">Section<input name="section" defaultValue={section} className="border border-line bg-surface px-3 py-2 text-body text-ink" /></label>
      <button className="bg-brand px-4 py-2 text-body font-semibold text-surface">Filter</button>
    </form>
    <p className="text-fine text-ink-3">Latest {entries.length} entries, up to 200.</p>
    <ul className="flex flex-col gap-3">
      {entries.map((entry, index) => <li key={`${entry.at}:${entry.recordId}:${index}`} className="flex flex-col gap-1 border border-line bg-surface p-4">
        <p className="text-fine text-ink-3"><time dateTime={entry.at}>{entry.at}</time>{" · "}{AUTH_ENABLED ? entry.who : "Sign-in off"}{" · "}{entry.collection}</p>
        <p className="text-body text-ink">{entry.summary}</p>
      </li>)}
    </ul>
  </main>;
}
