// Copy: PROGRAMMES > Catalyst grants, from the May 2025 call for proposals.
/*
  2026-09-24: the call's own terms, as published: what a project should show,
  and the funding each applicant group could apply for.
*/

export type GrantAward = { label: string; value: string; note: string };

export function GrantCallDetails({ intro, criteria, awards }: { intro: string; criteria: string[]; awards: GrantAward[] }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <div>
        <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">{intro}</p>
        <h3 className="display mt-8 text-sub">Projects should demonstrate</h3>
        <ul className="mt-4 flex flex-col gap-3">
          {criteria.map((item) => (
            <li key={item} className="border-l-2 border-brand-lift pl-4 text-body leading-relaxed text-ink-2">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="display text-sub">Funding available</h3>
        <dl className="mt-4 flex flex-col gap-px bg-line">
          {awards.map((award) => (
            <div key={award.label} className="bg-raise p-6">
              <dt className="kicker">{award.label}</dt>
              <dd className="display mt-2 text-title text-brand">{award.value}</dd>
              <dd className="mt-1 text-body text-ink-2">{award.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
