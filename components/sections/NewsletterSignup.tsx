"use client";

// Section. Copy: MEDIA > Newsletters. Sign-up counted in the admin dashboard.

import { useState } from "react";

export function NewsletterSignup() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  return (
    <form
      className="flex max-w-md flex-col gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const email = new FormData(event.currentTarget).get("email");
        setState("sending");
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => null);
        setState(response?.ok ? "done" : "error");
      }}
    >
      <label htmlFor="newsletter-email" className="text-fine text-ink-2">
        Get the next issue by email
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="min-w-0 flex-1 border border-line bg-surface px-3 py-2 text-body text-ink"
        />
        <button type="submit" disabled={state === "sending"} className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
          Subscribe
        </button>
      </div>
      <p aria-live="polite" className="text-fine text-ink-3">
        {state === "done" ? "Thank you. You are on the list." : state === "error" ? "That did not go through. Check the address and try again." : ""}
      </p>
    </form>
  );
}
