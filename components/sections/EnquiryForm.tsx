"use client";

/*
  Copy: CONTACT > the enquiry form. Structure: blueprint section 6, decision
  C-01 of 2026-09-11. The form is the first thing on the page, the reason is a
  dropdown rather than a separate selection step, and the topic arrives already
  chosen from a link such as /contact?topic=admissions.

  Three end states, and none of them lies: sent, could not send, and not
  connected yet. The last one gives the reader the team's own address rather
  than an apology.
*/

import { useState } from "react";

type Topic = { id: string; label: string };
type State = "idle" | "sending" | "sent" | "failed" | "unavailable";

export type EnquiryFormProps = {
  topics: Topic[];
  defaultTopic: string;
  labels: { name: string; email: string; reason: string; message: string };
  messagePrompt: string;
  submit: string;
  success: string;
  error: string;
  unavailable: string;
  email: string;
};

export function EnquiryForm({
  topics,
  defaultTopic,
  labels,
  messagePrompt,
  submit,
  success,
  error,
  unavailable,
  email,
}: EnquiryFormProps) {
  const [state, setState] = useState<State>("idle");

  const field =
    "rounded-edge border border-line bg-surface px-3 py-2.5 text-body text-ink disabled:opacity-60";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("sending");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setState("sent");
        form.reset();
        return;
      }
      setState(response.status === 503 ? "unavailable" : "failed");
    } catch {
      setState("failed");
    }
  }

  if (state === "sent") {
    return (
      <p className="border-l-2 border-moss bg-surface px-4 py-4 text-lead text-ink">{success}</p>
    );
  }

  return (
    <form className="flex max-w-[42rem] flex-col gap-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="kicker">{labels.name}</span>
          <input type="text" name="name" autoComplete="name" required className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="kicker">{labels.email}</span>
          <input type="email" name="email" autoComplete="email" required className={field} />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="kicker">{labels.reason}</span>
        <select name="reason" defaultValue={defaultTopic} className={field}>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="kicker">{labels.message}</span>
        <textarea
          name="message"
          rows={7}
          required
          placeholder={messagePrompt}
          className={field}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-edge bg-brand px-5 py-2.5 text-body font-medium text-surface transition-colors hover:bg-brand-live disabled:cursor-wait disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : submit}
        </button>
      </div>

      {state === "failed" || state === "unavailable" ? (
        <p role="alert" className="border-l-2 border-flag bg-surface px-4 py-3 text-body text-ink-2">
          {state === "unavailable" ? unavailable : error}{" "}
          <a href={`mailto:${email}`} className="font-medium text-brand">
            {email}
          </a>
        </p>
      ) : null}
    </form>
  );
}
