/*
  The LinkedIn data contract, fixed in
  docs/architecture/CDIE_Website_LinkedIn_Integration_Handoff_2026-09-11.md.

  It is fixed so the carousel and the read layer can be finished before the Make
  scenario exists. Build against the stub; swap the store later and only the
  read function changes.
*/

export type LinkedInPost = {
  /** urn:li:share:… or urn:li:activity:… — both work in the embed path */
  id: string;
  postedAt: string;
  text: string;
  embedUrl: string;
  permalink: string;
  /*
    Change request 2026-09-21, section 5: "the 3 recent posts, even reposts".

    A repost already reaches the store as an activity URN of its own, so it
    needs no new path through the read layer; what it needs is to be labelled,
    because a card that reads as CDIE's own words when the words are someone
    else's is a misattribution. The store supplies the flag; nothing here
    infers it from the text.
  */
  repost: boolean;
  /*
    Final pass 2026-09-23: the fan cards on Media lead with a picture and a
    title, as in the supplied reference. Both are optional sheet columns
    ("image", "title"); a post without them shows the CDIE mark and the
    opening words of its own text, never a stand-in picture.
  */
  image?: string;
  title?: string;
};

export type LinkedInFeed = {
  lastSyncedAt: string;
  posts: LinkedInPost[];
};

/*
  Make halts silently when its LinkedIn authorisation expires, roughly every
  sixty days, or when the free tier's operations run out. The site would keep
  showing old posts with no signal that anything is broken.

  So staleness is a first-class state, not an afterthought: past this window the
  section hides itself and falls back to a plain link out to the page.
*/
export const STALE_AFTER_HOURS = 48;

export function isStale(lastSyncedAt: string, now: Date = new Date()): boolean {
  const synced = Date.parse(lastSyncedAt);
  if (Number.isNaN(synced)) return true;
  return now.getTime() - synced > STALE_AFTER_HOURS * 60 * 60 * 1000;
}

const URN = /^urn:li:(share|activity|ugcPost):\d+$/;

/*
  URN validation lives here and nowhere else. A malformed row in the store must
  not be able to put an arbitrary iframe URL on the page, so the embed URL is
  rebuilt from the validated URN rather than trusted as supplied.
*/
export function normalisePost(raw: unknown): LinkedInPost | null {
  if (typeof raw !== "object" || raw === null) return null;
  const row = raw as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.trim() : "";
  if (!URN.test(id)) return null;

  const postedAt = typeof row.postedAt === "string" ? row.postedAt : "";
  if (Number.isNaN(Date.parse(postedAt))) return null;

  const repost = row.repost;
  const image = typeof row.image === "string" && /^https:\/\/\S+$/.test(row.image.trim()) ? row.image.trim() : undefined;
  const title = typeof row.title === "string" && row.title.trim() ? row.title.trim().slice(0, 120) : undefined;

  return {
    id,
    postedAt,
    text: typeof row.text === "string" ? row.text : "",
    embedUrl: `https://www.linkedin.com/embed/feed/update/${id}`,
    permalink: `https://www.linkedin.com/feed/update/${id}/`,
    // A sheet column arrives as text, so "TRUE", "true" and "1" all count.
    repost:
      repost === true || (typeof repost === "string" && /^(true|yes|1)$/i.test(repost.trim())),
    ...(image ? { image } : {}),
    ...(title ? { title } : {}),
  };
}

/*
  Stub store. Empty on purpose: no CDIE post is reproduced here, and an invented
  post would be exactly the fabrication this project is cleaning up. The shape
  is what matters until Make is wired.
*/
export const stubFeed: LinkedInFeed = {
  lastSyncedAt: "1970-01-01T00:00:00Z",
  posts: [],
};

export const linkedInCopy = {
  headline: "From our community",
  standfirst: "The three most recent posts from the CDIE account, reposts included.",
  fallback: "See the latest from CDIE on LinkedIn.",
  /** shown once the account URL is confirmed; see decision D17 and the copy note */
  pageUrl: null as string | null,
  // changes-v2, 2026-09-23: the embed note is not website copy.
  privacy: "",
} as const;
