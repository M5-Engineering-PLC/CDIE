"use client";

/*
  Lucid: Media > LinkedIn.
  Mechanism: docs/architecture/CDIE_Website_LinkedIn_Integration_Handoff_2026-09-11.md.

  CSS scroll-snap, no library: native swipe, inertia, keyboard and screen-reader
  behaviour come from the browser, and there is no dependency to keep updated.

  Each card starts as a placeholder holding the post text. An IntersectionObserver
  swaps in the real iframe only as the card approaches view, so a ten-card
  carousel loads one or two iframes rather than ten, and LinkedIn's tracking is
  not run for cards nobody looks at.
*/

import { useEffect, useRef, useState } from "react";

import type { LinkedInPost } from "@/content/linkedin";

export type LinkedInCarouselProps = {
  posts: LinkedInPost[];
  stale: boolean;
  fallback: string;
  pageUrl: string | null;
  privacy: string;
};

function PostCard({ post }: { post: LinkedInPost }) {
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
      className="w-[19rem] shrink-0 snap-start border border-line bg-surface sm:w-[22rem]"
    >
      {embed ? (
        <iframe
          src={post.embedUrl}
          title={`LinkedIn post from ${new Date(post.postedAt).toLocaleDateString("en-GB")}`}
          loading="lazy"
          className="h-[28rem] w-full border-0"
          allowFullScreen
        />
      ) : (
        <div className="flex h-[28rem] flex-col gap-4 p-5">
          <p className="font-mono text-fine text-ink-3">
            {new Date(post.postedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="line-clamp-[12] text-body leading-relaxed text-ink-2">{post.text}</p>
          <a
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            className="mt-auto text-body text-brand"
          >
            Read on LinkedIn ↗
          </a>
        </div>
      )}
    </li>
  );
}

export function LinkedInCarousel({
  posts,
  stale,
  fallback,
  pageUrl,
  privacy,
}: LinkedInCarouselProps) {
  if (stale || posts.length === 0) {
    return (
      <p className="text-body text-ink-2">
        {fallback}{" "}
        {pageUrl ? (
          <a href={pageUrl} target="_blank" rel="noreferrer" className="text-brand hover:text-brand-live">
            CDIE on LinkedIn ↗
          </a>
        ) : (
          <span className="text-ink-3">The account link is added once it is confirmed.</span>
        )}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>
      <p className="text-fine text-ink-3">{privacy}</p>
    </div>
  );
}
