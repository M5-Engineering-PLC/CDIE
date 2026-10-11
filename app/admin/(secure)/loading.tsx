// Dashboard: shown while a dashboard page loads, so a slow page is never a blank one. Internal tooling.
// Fix plan 2026-10-11, D6.

export default function DashboardLoading() {
  return (
    <main aria-busy="true" className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-10">
      <p role="status" className="text-fine text-ink-3">Loading…</p>
      <div className="h-8 w-64 max-w-full animate-pulse bg-raise" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="aspect-[4/3] animate-pulse bg-raise" />
        ))}
      </div>
    </main>
  );
}
