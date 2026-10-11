"use client";

// The last line of defence: shown when the root layout itself fails. Internal error state, not Actual Copy.
/*
  Fix plan 2026-10-11, D6: there was no error boundary anywhere in the app, so
  a failure above every page left the browser's bare error. This replaces the
  root layout while it shows, so it brings its own html and body.
*/

import "./globals.css";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body className="bg-paper">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-6">
          <h1 className="text-head text-ink">This page did not load.</h1>
          <p className="text-body text-ink-2">Something went wrong on our side. Try again, or reload the page.</p>
          {error.digest ? <p className="font-mono text-fine text-ink-3">Reference {error.digest}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => retry()} className="border border-brand bg-brand px-4 py-2 text-body font-semibold text-surface hover:bg-brand-live">
              Try again
            </button>
            <button type="button" onClick={() => window.location.reload()} className="border border-line bg-surface px-4 py-2 text-body text-ink-2 hover:border-brand hover:text-brand">
              Reload the page
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
