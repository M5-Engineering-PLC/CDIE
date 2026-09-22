// Analytics tiles and a month bar chart for the admin dashboard. Internal tooling.

export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line bg-surface p-5">
      <p className="text-fine text-ink-3">{label}</p>
      <p className="display mt-2 text-head tabular-nums text-ink">{value}</p>
    </div>
  );
}

export function MonthBars({ title, months }: { title: string; months: { label: string; value: number }[] }) {
  const max = Math.max(1, ...months.map((month) => month.value));

  return (
    <figure className="border border-line bg-surface p-5">
      <figcaption className="text-body font-semibold text-ink">{title}</figcaption>
      <ol className="mt-4 grid h-40 items-end gap-3" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}>
        {months.map((month) => (
          <li key={month.label} className="flex h-full flex-col items-center justify-end gap-1">
            <span className="font-mono text-fine tabular-nums text-ink-2">{month.value}</span>
            <span
              className="w-full max-w-10 rounded-t-sm bg-brand"
              style={{ height: `${(month.value / max) * 100}%`, minHeight: month.value ? 4 : 1 }}
            />
            <span className="text-fine text-ink-3">{month.label}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
