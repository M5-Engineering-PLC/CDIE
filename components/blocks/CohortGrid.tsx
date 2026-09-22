// Block. Lucid: Programmes > MDI > Cohorts. Records come from the admin dashboard.
// Only a cohort with a photograph is shown, per the 2026-09-22 enhancements.

export type CohortCard = { id: string; name: string; programme: string; year?: string; summary?: string; image: string };

export function CohortGrid({ items }: { items: CohortCard[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((cohort) => (
        <li key={cohort.id} className="flex flex-col overflow-hidden border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element -- dashboard uploads are served by a route */}
          <img src={cohort.image} alt={`${cohort.name}, ${cohort.programme}`} loading="lazy" className="aspect-[16/10] w-full object-cover" />
          <div className="flex flex-col gap-1 p-5">
            <p className="kicker">{[cohort.programme, cohort.year].filter(Boolean).join(" · ")}</p>
            <h3 className="display text-sub leading-snug text-ink">{cohort.name}</h3>
            {cohort.summary ? <p className="text-body text-ink-2">{cohort.summary}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
