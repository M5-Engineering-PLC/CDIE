/*
  The thin read layer from the integration handoff.

  It exists so the front end never knows about the store, so the store is not
  hit on every page view, and so URN shape is validated in exactly one place.

  Today it serves the stub. When the Make scenario and its sheet exist, only
  readStore() below changes; the response shape is the fixed data contract.
*/

import { NextResponse } from "next/server";

import { normalisePost, stubFeed, type LinkedInFeed } from "@/content/linkedin";

const CACHE_SECONDS = 600;

async function readStore(): Promise<{ lastSyncedAt: string; rows: unknown[] }> {
  // Replace with the Google Sheet read. Keep the return shape.
  return { lastSyncedAt: stubFeed.lastSyncedAt, rows: stubFeed.posts };
}

export async function GET() {
  const { lastSyncedAt, rows } = await readStore();

  const posts = rows
    .map(normalisePost)
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));

  const feed: LinkedInFeed = { lastSyncedAt, posts };

  return NextResponse.json(feed, {
    headers: {
      "cache-control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
    },
  });
}
