/* Fix plan 2026-10-11, W3: recent LinkedIn posts and their dashboard overrides. */

import { LinkedInPostEditor } from "@/components/admin/LinkedInPostEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { linkedinOverrides } from "@/lib/admin/linkedinOverrides";
import { sheetsConfigured } from "@/lib/admin/sheets";
import { getLinkedInPosts } from "@/lib/linkedin";
import { classifyPost } from "@/lib/linkedin/classify.mjs";
import { postKey } from "@/lib/linkedin/placement.mjs";

/* Admin data is read per request and never prerendered, whether or not sign-in is on. */
export const dynamic = "force-dynamic";

export default async function AdminLinkedInPage() {
  await requireAdmin();
  const [feed, overrides] = await Promise.all([getLinkedInPosts(), linkedinOverrides()]);
  const saved = new Map(overrides.map((row) => [postKey(row.url), row]));
  const configured = sheetsConfigured();
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 p-6 md:p-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-head text-ink">LinkedIn posts</h1>
        <p className="text-body text-ink-2">Choose Calendar, Community, or Hide. Save a date correction when the automatic date is wrong.</p>
        {!configured ? <p className="text-body text-ink-2">The Google Sheet is not configured. Automatic placement stays active. Overrides cannot be saved.</p> : null}
      </header>
      {feed.posts.map((post) => {
        const automatic = classifyPost(post);
        return <LinkedInPostEditor key={post.id} post={post} kind={automatic.kind} automaticDate={automatic.date}
          override={saved.get(postKey(post.permalink))} configured={configured} />;
      })}
      {!feed.posts.length ? <p className="text-body text-ink-2">No recent posts.</p> : null}
    </main>
  );
}
