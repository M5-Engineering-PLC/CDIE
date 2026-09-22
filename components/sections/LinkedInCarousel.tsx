"use client";

/*
  Lucid: Media > LinkedIn.
  Mechanism: docs/architecture/CDIE_Website_LinkedIn_Integration_Handoff_2026-09-11.md.

  CSS scroll-snap, no library: native swipe, inertia, keyboard and screen-reader
  behaviour come from the browser, and there is no dependency to keep updated.

  Change request 2026-09-21, section 5, "lets implement the listening feature".

  The page is static and revalidates on a timer, which means a reader who left
  the tab open an hour ago is looking at an hour-old band. This listens: when
  the tab comes back to the front, and no more often than the cache window, it
  re-reads /api/linkedin-posts and takes the newer answer. It never takes an
  emptier one — a store that has momentarily failed degrades to EMPTY_FEED, and
  replacing three good posts with nothing because of a blip would be worse than
  showing the three.

  Change request 2026-09-21, second pass: "apply smoother transitions for all
  carousels". This one is scrolled, never stepped, so what it needed was
  scroll-smooth: a keyboard or an anchor now eases the band along instead of
  jumping it. The reduced-motion rule in app/globals.css turns that off.
*/

import { useCallback, useEffect, useRef, useState } from "react";

import type { LinkedInPost } from "@/content/linkedin";
import { isStale } from "@/content/linkedin";
import { fetchLinkedInFeed } from "@/lib/linkedin/client";
import { CACHE_SECONDS, RECENT_POSTS } from "@/lib/linkedin/config";
import { useRailRotation } from "@/lib/useRailRotation";

import { LinkedInPostCard } from "./LinkedInPostCard";

export type LinkedInCarouselProps = {
  posts: LinkedInPost[];
  stale: boolean;
  fallback: string;
  pageUrl: string | null;
  privacy: string;
};

export function LinkedInCarousel({ posts, stale, fallback, pageUrl, privacy }: LinkedInCarouselProps) {
  const [feed, setFeed] = useState({ posts, stale });
  /* Null until the first check. The server render has no clock to read and
     reading one during render is not pure, so the window opens on the first
     time the tab is hidden and shown again. */
  const checked = useRef<number | null>(null);
  const rail = useRef<HTMLUListElement>(null);
  useRailRotation(rail);

  const listen = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    const now = Date.now();
    if (checked.current !== null && now - checked.current < CACHE_SECONDS * 1000) return;
    checked.current = now;
    const next = await fetchLinkedInFeed();
    if (next.posts.length === 0) return;
    setFeed({ posts: next.posts.slice(0, RECENT_POSTS), stale: isStale(next.lastSyncedAt) });
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", listen);
    return () => document.removeEventListener("visibilitychange", listen);
  }, [listen]);

  if (feed.stale || feed.posts.length === 0) {
    return (
      <p className="text-body text-ink-2">
        {fallback}{" "}
        {pageUrl ? (
          <a href={pageUrl} target="_blank" rel="noreferrer" className="text-brand hover:text-brand-live">
            CDIE on LinkedIn
          </a>
        ) : (
          <span className="text-ink-3">The account link is added once it is confirmed.</span>
        )}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul ref={rail} className="rail rail-glide gap-4 pb-3 sm:flex sm:snap-x sm:flex-row sm:overflow-x-auto">
        {feed.posts.map((post) => (
          <LinkedInPostCard key={post.id} post={post} />
        ))}
      </ul>
      <p className="text-fine text-ink-3">{privacy}</p>
    </div>
  );
}
