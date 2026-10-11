"use client";

// Dashboard: what a dashboard page shows when it fails, in place of the full-screen error. Internal tooling.
/*
  Fix plan 2026-10-11, D6: with no boundary, any server error on a dashboard
  page (a busy Google Sheet, a page asked of a deployment that has since been
  replaced) blanked the whole screen. This keeps the dashboard bar and offers
  two ways back: try the page again, or reload it, which also picks up a new
  deployment.
*/

import { useEffect } from "react";

const button = "border px-4 py-2 text-body transition-colors disabled:opacity-50";

// Next 16: retry() fetches the segment again and re-renders it.
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("[admin] page failed", error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-6 md:p-10">
      <h1 className="text-head text-ink">This page did not load.</h1>
      <p className="text-body text-ink-2">
        The Google Sheet may be busy, or the website may have just been updated. Anything you had already saved is safe.
      </p>
      {error.digest ? <p className="font-mono text-fine text-ink-3">Reference {error.digest}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()}className={`${button} border-brand bg-brand font-semibold text-surface hover:bg-brand-live`}>
          Try again
        </button>
        <button type="button" onClick={() => window.location.reload()} className={`${button} border-line bg-surface text-ink-2 hover:border-brand hover:text-brand`}>
          Reload the page
        </button>
      </div>
    </main>
  );
}
