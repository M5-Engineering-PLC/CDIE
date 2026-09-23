"use client";

// Section. Lucid: Media > LinkedIn. Visual reference: the fanned featured-work cards supplied 2026-09-23.
/*
  Final pass 2026-09-23: "the cards for the LinkedIn posts should follow the
  structure of the image. The priority card appears before the other cards and
  a 'Read More' button linked to the post. Use a similar style with the green
  card overlay and fan."

  The priority card is the most recent post: it opens at the centre, in front
  and full size, with the others fanned behind it on either side. Each card is
  a picture with a blue panel laid over its lower half carrying the date, the
  title, the opening of the post and a Read More pill to the post on LinkedIn.
  Revised 2026-09-23: the panel is CDIE blue, and the picture is the first
  image of the post itself (lib/linkedin/image.ts).
  The arrows, a swipe, the side cards and the labelled tabs underneath all
  bring a card to the front. The geometry is .fan-* in app/globals.css.
*/

import { useRef, useState } from "react";

import type { LinkedInPost } from "@/content/linkedin";

const SWIPE_PX = 48;

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The sheet's title column, else the post's own first sentence. */
function headline(post: LinkedInPost) {
  if (post.title) return post.title;
  const first = post.text.split(/(?<=[.!?])\s|\n/)[0]?.trim() ?? "";
  return first.length > 90 ? `${first.slice(0, 87).trimEnd()}…` : first || "CDIE on LinkedIn";
}

const tabLabel = (post: LinkedInPost) => headline(post).split(/\s+/).slice(0, 3).join(" ").replace(/[.,:;!?…]+$/, "");

export function LinkedInFan({ posts, fallbackImage }: { posts: LinkedInPost[]; fallbackImage: string }) {
  const [active, setActive] = useState(0);
  const down = useRef<number | null>(null);
  const count = posts.length;
  const go = (next: number) => setActive((next + count) % count);

  const swipe = (end: number) => {
    const start = down.current;
    down.current = null;
    if (start !== null && Math.abs(end - start) >= SWIPE_PX) go(active + (end < start ? 1 : -1));
  };

  return (
    <div className="fan" aria-roledescription="carousel" aria-label="Recent LinkedIn posts">
      <div
        className="fan-stage"
        onPointerDown={(event) => { down.current = event.clientX; }}
        onPointerUp={(event) => swipe(event.clientX)}
        onPointerCancel={() => { down.current = null; }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(active + 1);
          if (event.key === "ArrowLeft") go(active - 1);
        }}
      >
        {posts.map((post, index) => {
          // Signed distance from the front card, wrapped so the fan is symmetric.
          let offset = index - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const front = offset === 0;
          return (
            <article
              key={post.id}
              className="fan-card"
              data-front={front || undefined}
              style={{ "--offset": offset, "--depth": Math.abs(offset) } as React.CSSProperties}
              aria-hidden={!front}
            >
              {front ? null : <button type="button" className="fan-pick" tabIndex={-1} onClick={() => setActive(index)} />}
              <div className="fan-photo">
                {/* eslint-disable-next-line @next/next/no-img-element -- the picture is a URL from the sheet */}
                <img src={post.image ?? fallbackImage} alt="" loading="lazy" data-mark={!post.image || undefined} />
              </div>
              <div className="fan-panel">
                <p className="fan-kicker">{dateLabel(post.postedAt)}{post.repost ? " · Repost" : ""}</p>
                <h3 className="fan-title">{headline(post)}</h3>
                <p className="fan-summary">{post.text}</p>
                <a href={post.permalink} target="_blank" rel="noreferrer" className="fan-more" tabIndex={front ? 0 : -1}>
                  Read More<span className="sr-only"> on LinkedIn (opens in a new tab)</span>
                </a>
              </div>
            </article>
          );
        })}
        {count > 1 ? (
          <>
            <button type="button" className="fan-arrow" data-side="prev" aria-label="Previous post" onClick={() => go(active - 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className="fan-arrow" data-side="next" aria-label="Next post" onClick={() => go(active + 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        ) : null}
      </div>
      {count > 1 ? (
        <div className="fan-tabs" role="group" aria-label="Choose a post">
          {posts.map((post, index) => (
            <button key={post.id} type="button" aria-current={index === active} onClick={() => setActive(index)}>
              {tabLabel(post)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
