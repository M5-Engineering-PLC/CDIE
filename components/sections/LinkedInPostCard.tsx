"use client";

/*
  One post in the community feed.

  Each card starts as a placeholder holding the post text. An IntersectionObserver
  swaps in the real iframe only as the card approaches view, so a three-card
  feed loads the one being looked at rather than all three, and LinkedIn's
  tracking is not run for cards nobody reaches.

  Change request 2026-09-21, section 5: a repost is badged. The words in a
  repost are not CDIE's, and a card that does not say so misattributes them.
*/

import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { LinkedInPost } from "@/content/linkedin";

export function LinkedInPostCard({ post, index = 0 }: { post: LinkedInPost; index?: number }) {
  const ref = useRef<HTMLLIElement | null>(null);
  const [embed, setEmbed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || embed) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEmbed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [embed]);

  return (
    <li
      ref={ref}
      /*
        Enhancements 2026-09-22: "replicate the scroll on mobile feature on
        hackcessible.co.ke for people page". On a phone each post sticks under
        the header a few pixels lower than the last, the next one slides up
        over it, and the one beneath settles back (.post-stack in
        app/globals.css). From sm it is the row of fixed-width cards.
      */
      style={{ "--i": index } as CSSProperties}
      className="shrink-0 snap-start sm:w-[22rem]"
    >
      <div className="post-card flex h-[min(70svh,34rem)] w-full flex-col border border-line bg-surface sm:h-[28rem]">
      <p className="flex items-baseline justify-between gap-3 border-b border-line-soft px-4 py-2">
        <time dateTime={post.postedAt} className="font-mono text-fine text-ink-3">
          {new Date(post.postedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </time>
        {post.repost ? (
          <span className="font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">
            Repost
          </span>
        ) : null}
      </p>

      {embed ? (
        <iframe
          src={post.embedUrl}
          title={`LinkedIn post from ${new Date(post.postedAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}`}
          loading="lazy"
          className="w-full flex-1 border-0"
          allowFullScreen
        />
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-5">
          <p className="line-clamp-[12] text-body leading-relaxed text-ink-2">{post.text}</p>
          <a href={post.permalink} target="_blank" rel="noreferrer" className="mt-auto text-body text-brand">
            Read on LinkedIn
          </a>
        </div>
      )}
      </div>
    </li>
  );
}
