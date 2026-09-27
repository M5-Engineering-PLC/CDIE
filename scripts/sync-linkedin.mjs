// Refresh the committed LinkedIn feed and its images outside the request path.
// Discover public company posts, merge dashboard links and optional sheet rows,
// then commit a local copy for page requests. Run with Node 24.

import { mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { normalisePost } from "../content/linkedin.ts";
import { events } from "../content/programmes.ts";
import { readTab, sheetCredentials } from "../lib/admin/sheets.ts";
import { parseCsv } from "../lib/linkedin/csv.ts";
import { MAX_POSTS } from "../lib/linkedin/config.ts";
import { pickPostImage } from "../lib/linkedin/image.ts";
import { rowsFromLinks } from "../lib/linkedin/links.ts";
import { fetchPublicPosts } from "../lib/linkedin/public.ts";

const sheetUrl = process.env.LINKEDIN_SHEET_CSV_URL?.trim();
const rowsFile = process.argv.includes("--rows-file") ? process.argv[process.argv.indexOf("--rows-file") + 1] : null;
const snapshotFile = new URL("../content/linkedin-snapshot.json", import.meta.url);
const imageDir = new URL("../public/linkedin/", import.meta.url);
const timeout = 8_000;
const maxImageBytes = 8 * 1024 * 1024;
const optional = process.argv.includes("--optional");
const previous = JSON.parse(await readFile(snapshotFile, "utf8"));

if (sheetUrl && (new URL(sheetUrl).protocol !== "https:" || new URL(sheetUrl).hostname !== "docs.google.com")) {
  throw new Error("LINKEDIN_SHEET_CSV_URL must be a published https docs.google.com CSV URL");
}

const cms = JSON.parse(await readFile(new URL("../content/cms-snapshot.json", import.meta.url), "utf8"));
let rows = [];
try {
  if (rowsFile) rows = JSON.parse(await readFile(rowsFile, "utf8"));
  else if (sheetCredentials()) rows = await readTab(process.env.LINKEDIN_SHEET_TAB?.trim() || "Untitled");
  else if (sheetUrl) {
    const response = await fetch(sheetUrl, {
      headers: { accept: "text/csv" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`LinkedIn sheet read failed: ${response.status}`);
    rows = parseCsv(await response.text());
  }
} catch (error) {
  if (!optional) throw error;
  console.warn("Sheet unavailable; retaining its last cached posts:", error);
}
const published = await fetchPublicPosts();
const dashboard = rowsFromLinks(cms.items?.posts ?? []);
if (!published.length && !rows.length && !dashboard.length) {
  console.warn("No new feed source available; retaining the previous posts.");
}
// Preserve sheet image, repost and title metadata for posts also found publicly.
// Public page dates and text win because they come from the original post.
const merged = new Map();
for (const source of [previous.posts, rows, dashboard, published]) {
  for (const row of source) {
    const post = normalisePost(row);
    if (post) {
      const earlier = merged.get(post.id);
      merged.set(post.id, {
        ...earlier, ...post,
        image: post.image ?? earlier?.image,
        title: post.title ?? earlier?.title,
        repost: post.repost || earlier?.repost || false,
      });
    }
  }
}
const posts = [...merged.values()]
  .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt)).slice(0, MAX_POSTS);

const previousPosts = new Map(previous.posts.map((post) => [post.id, post]));
const previousEvents = previous.eventImages ?? {};
await mkdir(imageDir, { recursive: true });

const localExists = async (value) => {
  if (typeof value !== "string" || !/^\/linkedin\/[a-z0-9-]+\.(jpg|png|webp|avif)$/.test(value)) return false;
  try { return (await stat(new URL(`../public${value}`, import.meta.url))).isFile(); }
  catch { return false; }
};

const validLinkedInImage = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "media.licdn.com" ? url.href : null;
  } catch { return null; }
};

const imageFromPost = async (permalink) => {
  try {
    const result = await fetch(permalink, {
      headers: { accept: "text/html", "user-agent": "Mozilla/5.0 (compatible; CDIE-website/1.0)" },
      signal: AbortSignal.timeout(timeout),
    });
    return result.ok ? pickPostImage(await result.text()) : null;
  } catch { return null; }
};

const extension = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif",
};

async function saveImage(name, source, permalink, oldPath) {
  if (await localExists(oldPath)) return oldPath;
  const imageUrl = validLinkedInImage(source) ?? await imageFromPost(permalink);
  if (!imageUrl) return null;
  try {
    const result = await fetch(imageUrl, { signal: AbortSignal.timeout(timeout) });
    if (!result.ok || !validLinkedInImage(result.url)) return null;
    const mime = result.headers.get("content-type")?.split(";")[0].toLowerCase();
    const ext = extension[mime];
    if (!ext || Number(result.headers.get("content-length") ?? 0) > maxImageBytes) return null;
    const bytes = Buffer.from(await result.arrayBuffer());
    if (!bytes.length || bytes.length > maxImageBytes) return null;
    const filename = `${name}.${ext}`;
    await writeFile(new URL(filename, imageDir), bytes);
    return `/linkedin/${filename}`;
  } catch { return null; }
}

// Keep parallel requests bounded: LinkedIn may throttle a burst of old events.
async function mapLimited(items, fn, limit = 3) {
  const result = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      result[index] = await fn(items[index]);
    }
  }));
  return result;
}

const cachedPosts = await mapLimited(posts, async (post) => {
  const filename = `post-${post.id.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const image = await saveImage(filename, post.image, post.permalink, previousPosts.get(post.id)?.image);
  return { ...post, image: image ?? undefined };
});

const calendar = [
  ...events,
  ...(cms.items?.events ?? []),
  ...(cms.items?.activities ?? []),
  ...(cms.items?.posts ?? []),
].filter((event) => !event.image && /^https:\/\/www\.linkedin\.com\/feed\/update\/urn:li:/.test(event.link ?? ""));
const eventImages = {};
await mapLimited(calendar, async (event) => {
  const id = event.link.match(/urn:li:(?:share|activity|ugcPost):(\d+)/)?.[1];
  if (!id) return;
  const image = await saveImage(`event-${id}`, null, event.link, previousEvents[event.link]);
  if (image) eventImages[event.link] = image;
});

const heartbeats = rows.map((row) => Date.parse(row.syncedAt ?? "")).filter(Number.isFinite);
const snapshot = {
  lastSyncedAt: published.length || dashboard.length
    ? null
    : heartbeats.length ? new Date(Math.max(...heartbeats)).toISOString() : previous.lastSyncedAt,
  posts: cachedPosts,
  eventImages: Object.fromEntries(Object.entries(eventImages).sort(([a], [b]) => a.localeCompare(b))),
};
if (JSON.stringify(snapshot) !== JSON.stringify(previous)) {
  await writeFile(snapshotFile, `${JSON.stringify(snapshot, null, 2)}\n`);
}

const used = new Set([
  ...cachedPosts.map((post) => post.image),
  ...Object.values(eventImages),
].filter(Boolean).map((item) => item.slice("/linkedin/".length)));
for (const name of await readdir(imageDir)) {
  if (/^(post|event)-[a-z0-9-]+\.(jpg|png|webp|avif)$/.test(name) && !used.has(name)) {
    await unlink(new URL(name, imageDir));
  }
}
console.log(`LinkedIn snapshot: ${cachedPosts.length} posts, ${Object.keys(eventImages).length} event images`);
