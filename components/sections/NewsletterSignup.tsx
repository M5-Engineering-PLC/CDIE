"use client";

/*
  Section. Copy: MEDIA > Newsletters.

  2026-09-25, double opt-in. What the reader sees follows what actually
  happened, rather than one blanket thank you:

  - "check"    the address is new and a confirmation link is on its way
  - "already"  it is on the list already, so nothing was sent
  - "recorded" it was saved, but sending is not switched on yet
  - "invalid" / "error" the form stays, with the address still typed in

  On success the panel takes the form's place, so nothing on the page jumps.
  A subscriber who comes back sees the panel rather than an empty field, which
  is the one thing worth remembering in the browser.
*/

import { useEffect, useState } from "react";

const REMEMBER = "cdie-newsletter";

type State = "idle" | "sending" | "check" | "already" | "recorded" | "invalid" | "error";

const PANEL: Partial<Record<State, { title: string; body: string }>> = {
  check: {
    title: "Check your inbox.",
    body: "We have sent you a link to confirm your address. Open it and the next issue will come to you by email.",
  },
  already: {
    title: "You are already on the list.",
    body: "This address is subscribed, so we have not sent anything new. Every issue carries a link to unsubscribe.",
  },
  recorded: {
    title: "You are on the list.",
    body: "We have your address and you will hear from us when the next issue is published.",
  },
};

export function NewsletterSignup() {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    // After paint: the server renders the form, and a returning subscriber's
    // panel replaces it once the browser has answered.
    const frame = requestAnimationFrame(() => {
      try {
        if (localStorage.getItem(REMEMBER)) setState("recorded");
      } catch {
        // A browser with site data blocked simply shows the form.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const panel = PANEL[state];
  if (panel) {
    return (
      <div className="flex max-w-md items-start gap-3 border-l-2 border-brand bg-raise p-4">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 fill-current text-brand">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.1 14.2-4-4 1.4-1.4 2.6 2.6 5.4-5.4 1.4 1.4-6.8 6.8z" />
        </svg>
        <div>
          <p className="text-lead text-ink">{panel.title}</p>
          <p className="mt-1 text-body text-ink-2">{panel.body}</p>
        </div>
      </div>
    );
  }

  return (
    <form
      className="relative flex max-w-md flex-col gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setState("sending");
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: String(data.get("email") ?? ""), company_website: data.get("company_website") }),
        }).catch(() => null);

        if (!response) return setState("error");
        if (response.status === 400) return setState("invalid");
        if (!response.ok) return setState("error");

        const { state: outcome } = (await response.json()) as { state?: State };
        try {
          localStorage.setItem(REMEMBER, "1");
        } catch {
          // Remembering is a convenience; the subscription is recorded server-side.
        }
        setState(outcome ?? "recorded");
      }}
    >
      {/* 2026-09-25: the honeypot, as on the enquiry form. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
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
          aria-describedby="newsletter-note"
          className="min-w-0 flex-1 border border-line bg-surface px-3 py-2 text-[1rem] text-ink sm:text-body"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50"
        >
          {state === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <p id="newsletter-note" aria-live="polite" className="text-fine text-ink-3">
        {state === "invalid"
          ? "That address does not look right. Check it and try again."
          : state === "error"
            ? "That did not go through. Try again in a moment, or email ive@ku.ac.ke."
            : "We will email you to confirm. Every issue has an unsubscribe link."}
      </p>
    </form>
  );
}
