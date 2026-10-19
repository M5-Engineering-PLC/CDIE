/*
  The first picture of a LinkedIn post, for the Media fan cards.

  Revised 2026-09-23: "the image on the card should be retrieved from the
  particular LinkedIn post (the first image on the post)". The scheduled sync
  reads its og:image, downloads the photo and commits it under public/linkedin.
  Page rendering and browsers never request this URL.

  Only a post photograph is accepted: an https URL on media.licdn.com under a
  feedshare path. When a post has no picture LinkedIn puts the company logo or
  a profile photo there instead, and that must not stand in for the post, so
  anything else reads as "no image" and the card shows the CDIE mark.

  Revised 2026-10-19: a video post's og:image is a dms.licdn.com play-button
  overlay, which stays rejected. Its JSON-LD thumbnailUrl is the clean cover on
  media.licdn.com under /videocover-, which is accepted and marks the post as a
  video. The signed mp4 contentUrl is never read or stored.
*/

export type PostImage = { url: string; video: boolean };

const meta = (html: string, property: string) =>
  (html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"))
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i")))?.[1];

function licdn(raw: string | undefined, path: RegExp): string | null {
  if (!raw) return null;
  try {
    const parsed = new URL(raw.replace(/&amp;/g, "&"));
    if (parsed.protocol !== "https:" || parsed.hostname !== "media.licdn.com") return null;
    return path.test(parsed.pathname) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function thumbnails(html: string): string[] {
  const found: string[] = [];
  const visit = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (typeof node !== "object" || node === null) return;
    for (const [key, value] of Object.entries(node)) {
      if (key === "thumbnailUrl" && typeof value === "string") found.push(value);
      else visit(value);
    }
  };
  for (const block of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(block[1])); } catch { /* skip broken JSON-LD */ }
  }
  return found;
}

export function pickPostMedia(html: string): PostImage | null {
  for (const raw of thumbnails(html)) {
    const url = licdn(raw, /\/videocover-/);
    if (url) return { url, video: true };
  }
  const url = licdn(meta(html, "og:image"), /\/feedshare-/);
  return url ? { url, video: false } : null;
}

export function pickPostImage(html: string): string | null {
  return pickPostMedia(html)?.url ?? null;
}
