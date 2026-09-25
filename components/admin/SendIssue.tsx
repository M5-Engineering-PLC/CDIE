"use client";

// Sends one newsletter issue to the confirmed subscribers. Internal tooling.
// A test send to one address comes first; the real send names the count and,
// once an issue has gone out, asks again before repeating it.

import { useActionState } from "react";

import { sendIssue } from "@/app/admin/actions";

export function SendIssue({
  id,
  subscribers,
  sentAt,
  sentCount,
}: {
  id: string;
  subscribers: number;
  sentAt?: string;
  sentCount?: string;
}) {
  const [error, action, pending] = useActionState(sendIssue, null);

  return (
    <form action={action} className="flex flex-col gap-3 border-t border-line-soft p-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-fine text-ink-3">
        {sentAt
          ? `Sent ${new Date(sentAt).toLocaleDateString("en-GB", { dateStyle: "medium" })} to ${sentCount ?? "?"} subscribers.`
          : "Not sent yet."}{" "}
        {subscribers} confirmed {subscribers === 1 ? "subscriber" : "subscribers"} on the list.
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-fine text-ink-2">
          Test it on one address first
          <input
            name="test"
            type="email"
            placeholder="you@ku.ac.ke"
            className="border border-line bg-surface px-3 py-2 text-body text-ink"
          />
        </label>
        <button
          type="submit"
          name="mode"
          value="test"
          disabled={pending}
          className="border border-line px-4 py-2 text-body text-ink transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
        >
          Send test
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="mode"
          value="live"
          disabled={pending || subscribers === 0}
          className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50"
        >
          {pending ? "Sending…" : `Send to ${subscribers}`}
        </button>
        {sentAt ? (
          <label className="flex items-center gap-2 text-fine text-ink-2">
            <input type="checkbox" name="again" value="yes" /> send it again
          </label>
        ) : null}
      </div>

      {error ? <p role="alert" className="text-fine text-brand">{error}</p> : null}
    </form>
  );
}
