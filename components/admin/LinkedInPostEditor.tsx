/* Fix plan 2026-10-11, W3: dashboard placement controls for a saved LinkedIn post. */
"use client";

import { useActionState } from "react";

import { saveLinkedInPost, type LinkedInSaveState } from "@/app/admin/linkedin-actions";
import type { LinkedInOverride } from "@/lib/admin/linkedinOverrides";
import type { LinkedInPost } from "@/lib/linkedin";

const input = "border border-line bg-surface px-3 py-2 text-body text-ink";

export function LinkedInPostEditor({ post, kind, automaticDate, override, configured }: {
  post: LinkedInPost;
  kind: string;
  automaticDate: string | null;
  override?: LinkedInOverride;
  configured: boolean;
}) {
  const [state, action, pending] = useActionState(saveLinkedInPost, {} as LinkedInSaveState);
  return (
    <article className="flex flex-col gap-3 border border-line bg-surface p-6">
      <a href={post.permalink} target="_blank" rel="noreferrer" className="text-body text-brand hover:text-brand-live">
        {post.title || post.text.split("\n").find((line) => line.trim()) || post.id}
      </a>
      <p className="text-fine text-ink-2">Automatic kind: {kind}. Post date: {post.postedAt.slice(0, 10)}.</p>
      <p className="text-fine text-ink-2">
        {automaticDate ? `Date in the post: ${automaticDate}.` : "No date in the text. Calendar placement uses the post date and the Announcement label."}
      </p>
      <p className="text-body text-ink-2">{post.text}</p>
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="url" value={post.permalink} />
        <fieldset disabled={pending || !configured} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-fine text-ink-2">
            Show in
            <select name="placement" defaultValue={override?.placement ?? (kind === "community" ? "community" : "calendar")} className={input}>
              <option value="calendar">Calendar</option>
              <option value="community">Community</option>
              <option value="hidden">Hide</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-fine text-ink-2">
            Date correction (optional)
            <input name="date" type="date" defaultValue={override?.date ?? ""} className={input} />
          </label>
          <button type="submit" disabled={pending || !configured} className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
            {pending ? "Saving…" : "Save"}
          </button>
        </fieldset>
        {state.error ? <p role="alert" className="text-fine text-brand">{state.error}</p> : null}
        {state.saved ? <p role="status" className="text-fine text-ink-2">Saved.</p> : null}
      </form>
    </article>
  );
}
