// Dashboard drafts: the bar that holds a page's unsaved changes. Internal tooling.
// Fix plan 2026-10-11, D7: shown whenever a draft exists, with Discard and Review changes.

export function ChangesBar({ count, pending, onDiscard, onReview }: {
  count: number;
  pending: boolean;
  onDiscard: () => void;
  onReview: () => void;
}) {
  if (count === 0) return null;
  return (
    <div role="region" aria-label="Unsaved changes" className="sticky bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-3">
        <p className="min-w-0 flex-1 text-body text-ink">
          {count} change{count === 1 ? "" : "s"} not saved. Nothing reaches the website until you save.
        </p>
        <button type="button" onClick={onDiscard} disabled={pending}
          className="border border-line bg-surface px-4 py-2 text-body text-ink-2 transition-colors hover:border-brand hover:text-brand disabled:opacity-50">
          Discard
        </button>
        <button type="button" onClick={onReview} disabled={pending}
          className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
          Review changes
        </button>
      </div>
    </div>
  );
}
