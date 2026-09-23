/*
  The first picture of a LinkedIn post, for the Media fan cards.

  Revised 2026-09-23: "the image on the card should be retrieved from the
  particular LinkedIn post (the first image on the post)". LinkedIn's public
  post page carries that image as its og:image, so it is read from there, on
  the server, once a day per post. No API key and nothing in the browser.

  Only a post photograph is accepted: an https URL on media.licdn.com under a
  feedshare path. When a post has no picture LinkedIn puts the company logo or
  a profile photo there instead, and that must not stand in for the post, so
  anything else reads as "no image" and the card shows the CDIE mark.
*/

const DAY_SECONDS = 86_400;

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

/** The post's first image, or null. Never throws: a missing picture is not an error. */
export async function fetchPostImage(permalink: string): Promise<string | null> {
  try {
    const response = await fetch(permalink, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; CDIE-website/1.0; +https://www.linkedin.com)",
        accept: "text/html",
      },
      next: { revalidate: DAY_SECONDS },
    });
    if (!response.ok) return null;
    return pickPostImage(await response.text());
  } catch {
    return null;
  }
}
