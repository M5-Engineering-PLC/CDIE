// Dashboard preview: a record drawn with the markup its public page uses. Internal tooling.
/*
  Final pass 2026-09-23: "preview elements in the dashboard as will be seen in
  the website". Each collection renders the way its page shows it: posts,
  events and activities as a row of the Media events chart, newsletters as a
  Media newsletter card, staff as an About team card, cohorts as an MDI
  success-story card. The markup mirrors those blocks; the images are plain img
  because a preview may be a local file that has not been uploaded yet.
*/

import { CohortGrid } from "@/components/blocks/CohortGrid";
import { EventGantt } from "@/components/blocks/EventGantt";
import type { CollectionId } from "@/lib/admin/collections";

export type PreviewValues = Record<string, string | undefined>;

const LABEL: Partial<Record<CollectionId, string>> = { posts: "Post", events: "Event", activities: "Activity" };

const shift = (iso: string, days: number) => new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);

function Frame({ where, children }: { where: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-mono text-fine uppercase tracking-widest text-ink-3">As seen on {where}</figcaption>
      <div className="border border-dashed border-line bg-paper p-4">{children}</div>
    </figure>
  );
}

export function ItemPreview({ collection, values }: { collection: CollectionId; values: PreviewValues }) {
  const v = (key: string, fallback = "") => values[key]?.trim() || fallback;

  if (collection === "newsletters") {
    return (
      <Frame where="Media, Newsletters">
        <article className="flex max-w-sm flex-col border border-line bg-raise">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview of a local or uploaded file */}
          {v("image") ? <img src={v("image")} alt="" className="aspect-[16/10] w-full object-cover" /> : <div className="aspect-[16/10] w-full bg-line-soft" />}
          <div className="flex flex-col gap-3 p-6">
            <p className="kicker">{v("issue", "Issue label")}</p>
            <h3 className="display text-sub leading-snug">{v("title", "Title")}</h3>
            <p className="text-body leading-relaxed text-ink-2">{v("summary", "Summary")}</p>
            {v("pdf") ? <p className="pt-2 font-medium text-brand">Read this issue →</p> : null}
          </div>
        </article>
      </Frame>
    );
  }

  if (collection === "staff") {
    return (
      <Frame where="About, Our team">
        <article className="about-person flex max-w-[15rem] flex-col overflow-hidden border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview of a local or uploaded file */}
          {v("image") ? <img src={v("image")} alt="" className="aspect-[5/6] w-full object-cover" /> : <div className="aspect-[5/6] w-full bg-raise" />}
          <div className="flex flex-col gap-1 border-t border-line p-5">
            <p className="display text-sub leading-snug text-ink">{v("name", "Name")}</p>
            <p className="text-body text-ink-2">{v("role", "Role")}</p>
          </div>
        </article>
        {!v("image") ? <p className="mt-3 text-fine text-ink-3">Not shown on the site until it has a portrait.</p> : null}
      </Frame>
    );
  }

  if (collection === "cohorts") {
    return (
      <Frame where="MSc MDI, Success stories">
        {v("image") ? (
          <CohortGrid items={[{ id: "preview", name: v("name", "Cohort name"), programme: v("programme", "Programme"), year: v("year"), summary: v("summary"), image: v("image") }]} />
        ) : (
          <p className="text-fine text-ink-3">Not shown on the site until it has a photograph.</p>
        )}
      </Frame>
    );
  }

  const start = v(collection === "posts" ? "date" : "start", new Date().toISOString().slice(0, 10));
  return (
    <Frame where="Media, Events calendar">
      <EventGantt
        items={[{ id: "preview", title: v("title", "Title"), start, end: v("end") || undefined, kind: LABEL[collection], link: v("link") || undefined }]}
        from={shift(start, -45)}
        to={shift(v("end", start), 45)}
        today={new Date().toISOString().slice(0, 10)}
      />
    </Frame>
  );
}
