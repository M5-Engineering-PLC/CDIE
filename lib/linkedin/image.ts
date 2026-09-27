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
*/

export function pickPostImage(html: string): string | null {
  const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (!match) return null;
  const url = match[1].replace(/&amp;/g, "&");
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "media.licdn.com") return null;
    return /\/feedshare-/.test(parsed.pathname) ? parsed.toString() : null;
  } catch {
    return null;
  }
}
