/*
  The thin read layer from the integration handoff.

  It exists so the front end never knows about the store, so the store is not
  hit on every page view, and so URN shape is validated in exactly one place.

  The work now lives in lib/linkedin; this file is only the HTTP edge. A server
  component should call getLinkedInFeed() instead and skip the round trip.
*/

import { NextResponse } from "next/server";

import { CACHE_SECONDS, getLinkedInFeed } from "@/lib/linkedin";

export async function GET() {
  const feed = await getLinkedInFeed();

  return NextResponse.json(feed, {
    headers: {
      "cache-control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
    },
  });
}
