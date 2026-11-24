// Refresh the committed LinkedIn feed and its images outside the request path.
// Discover public company posts, merge dashboard links and optional sheet rows,
// then commit a local copy for page requests. Run with Node 24.

import { mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { normalisePost, STALE_AFTER_HOURS } from "../content/linkedin.ts";
import { events } from "../content/programmes.ts";
import { readTab, sheetCredentials } from "../lib/admin/sheets.ts";
import { parseCsv } from "../lib/linkedin/csv.ts";
import { MAX_POSTS } from "../lib/linkedin/config.ts";
import { pickPostMedia } from "../lib/linkedin/image.ts";
import { rowsFromLinks } from "../lib/linkedin/links.ts";
import { isCoverId, linkedInApi } from "../lib/linkedin/api.mjs";
import { fetchPublicPosts } from "../lib/linkedin/public.ts";
import { carryCalendar } from "../lib/linkedin/classify.mjs";

const sheetUrl = process.env.LINKEDIN_SHEET_CSV_URL?.trim();
const rowsFile = process.argv.includes("--rows-file") ? process.argv[process.argv.indexOf("--rows-file") + 1] : null;
const snapshotFile = new URL("../content/linkedin-snapshot.json", import.meta.url);
const imageDir = new URL("../public/linkedin/", import.meta.url);
const timeout = 8_000;
const maxImageBytes = 8 * 1024 * 1024;
const optional = process.argv.includes("--optional");
const previous = JSON.parse(await readFile(snapshotFile, "utf8"));

/* Fix plan 2026-10-11, W3: reclassify the saved posts without any network or image work. */
if (process.argv.includes("--reclassify")) {
  const calendar = carryCalendar(previous.posts, previous.calendar);
  await writeFile(snapshotFile, `${JSON.stringify({ ...previous, calendar }, null, 2)}\n`);
  console.log(`LinkedIn snapshot: ${previous.posts.length} posts, ${calendar.length} calendar items (offline)`);
  process.exit(0);
}

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
  if (rowsFile && !optional) throw error;
  console.warn("LinkedIn sheet unavailable:", error.message);
}
const hasContent = (post) => post && (post.text.trim() || post.title || post.image || post.video);
let api;
let authenticated = [];
let apiFailure;
try {
  api = linkedInApi();
  authenticated = (await api?.posts() ?? [])
    .filter((row) => {
      const post = normalisePost(row);
      return post && (hasContent(post) || isCoverId(row.mediaId));
    });
  if (api && !authenticated.length) apiFailure = "LinkedIn API returned no usable public posts";
} catch (error) {
  apiFailure = error.message;
}
let publicFailure;
const published = authenticated.length ? [] : await fetchPublicPosts(undefined, (reason) => { publicFailure = reason; });
const dashboard = rowsFromLinks(cms.items?.posts ?? []);
const newest = (list) => list.map((row) => Date.parse(row.postedAt)).filter(Number.isFinite).reduce((latest, date) => Math.max(latest, date), -Infinity);
const newestLabel = (list) => Number.isFinite(newest(list)) ? new Date(newest(list)).toISOString() : "none";
console.log(`Sources: LinkedIn API ${authenticated.length}, public page ${published.length}, sheet ${rows.length} (newest ${newestLabel(rows)}), dashboard ${dashboard.length}`);

if (apiFailure) console.warn(apiFailure);
if (publicFailure) console.warn(publicFailure);
const fallbackPosts = [...rows, ...dashboard].map(normalisePost)
  .filter(hasContent);
const publicPosts = published.filter((row) => hasContent(normalisePost(row)));
const now = Date.now();
const heartbeats = rows.filter((row) => hasContent(normalisePost(row)))
  .map((row) => Date.parse(row.syncedAt ?? ""))
  .filter((date) => Number.isFinite(date) && date <= now);
const sheetIsCurrent = Math.max(...heartbeats) >= now - STALE_AFTER_HOURS * 3_600_000;
if (!authenticated.length && !publicPosts.length && !sheetIsCurrent
  && newest(fallbackPosts) <= newest(previous.posts)) {
  const message = "LinkedIn discovery produced no usable updates. Keeping the saved snapshot.";
  console.warn(message);
  process.exitCode = optional ? 0 : 1;
} else {
  await refreshSnapshot();
}

async function refreshSnapshot() {
  const mediaIds = new Map(authenticated.filter((row) => isCoverId(row.mediaId)).map((row) => [row.id, row.mediaId]));
  // Preserve sheet image, repost and title metadata for posts also found publicly.
  // Public page dates and text win because they come from the original post.
  const merged = new Map();
  for (const source of [previous.posts, rows, dashboard, publicPosts, authenticated]) {
    for (const row of source) {
      const post = normalisePost(row);
      if (post) {
        const earlier = merged.get(post.id);
        const text = post.text.trim() ? post.text : earlier?.text ?? "";
        if (!earlier && !text && !post.title && !post.image && !post.video && !mediaIds.get(post.id)) continue;
        merged.set(post.id, {
          ...earlier, ...post, text,
          postedAt: post.text.trim() || !earlier ? post.postedAt : earlier.postedAt,
          image: post.image ?? earlier?.image,
          title: post.title ?? earlier?.title,
          repost: post.repost || earlier?.repost || false,
        });
      }
    }
  }
  const recentPosts = (posts) => posts.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt)).slice(0, MAX_POSTS);
  const posts = recentPosts([...merged.values()]);

  const previousPosts = new Map(previous.posts.map((post) => [post.id, post]));
  const previousEvents = previous.eventImages ?? {};
  await mkdir(imageDir, { recursive: true });

  const localExists = async (value) => {
    if (typeof value !== "string" || !/^\/linkedin\/[a-z0-9-]+\.(jpg|png|webp|avif)$/.test(value)) return false;
    try { return (await stat(new URL(`../public${value}`, import.meta.url))).isFile(); }
    catch { return false; }
  };

  const validLinkedInImage = (value, fromApi = false) => {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return null;
      const publicImage = url.hostname === "media.licdn.com" && /\/(?:feedshare|videocover)-/.test(url.pathname);
      const apiImage = fromApi && /^media(?:-exp\d+)?\.licdn\.com$|^media\.licdn-ei\.com$/.test(url.hostname)
        && /^\/dms\/image(?:-recursion)?\//.test(url.pathname);
      return publicImage || apiImage ? url.href : null;
    } catch { return null; }
  };

  const mediaFromPost = async (permalink) => {
    try {
      const result = await fetch(permalink, {
        headers: { accept: "text/html", "user-agent": "Mozilla/5.0 (compatible; CDIE-website/1.0)" },
        signal: AbortSignal.timeout(timeout),
      });
      return result.ok ? pickPostMedia(await result.text()) : null;
    } catch { return null; }
  };

  const extension = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif",
  };

  async function saveImage(name, source, permalink, oldPath, wasVideo = false, detect = true, mediaId) {
    const hasLocal = await localExists(oldPath);
    let apiCover;
    if (mediaId && (!hasLocal || (mediaId.startsWith("urn:li:video:") && !wasVideo))) {
      try { apiCover = await api.cover(mediaId); } catch (error) { console.warn(error.message); }
    }
    const apiImage = validLinkedInImage(apiCover?.url, true);
    const found = !apiImage && (detect || !hasLocal) ? await mediaFromPost(permalink) : null;
    const video = Boolean(apiCover?.video || found?.video || wasVideo || mediaId?.startsWith("urn:li:video:"));
    if (hasLocal) return { path: oldPath, video };
    const imageUrl = apiImage ?? validLinkedInImage(source) ?? found?.url;
    if (!imageUrl) return null;
    try {
      const result = await fetch(imageUrl, { redirect: "error", signal: AbortSignal.timeout(timeout) });
      if (!result.ok || !validLinkedInImage(result.url, Boolean(apiImage))) return null;
      const mime = result.headers.get("content-type")?.split(";")[0].toLowerCase();
      const ext = extension[mime];
      if (!ext || Number(result.headers.get("content-length") ?? 0) > maxImageBytes) return null;
      const bytes = Buffer.from(await result.arrayBuffer());
      if (!bytes.length || bytes.length > maxImageBytes) return null;
      const filename = `${name}.${ext}`;
      await writeFile(new URL(filename, imageDir), bytes);
      return { path: `/linkedin/${filename}`, video };
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

  const refreshedPosts = await mapLimited(posts, async (post) => {
    const filename = `post-${post.id.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
    const cached = previousPosts.get(post.id);
    const mediaId = mediaIds.get(post.id);
    const saved = await saveImage(filename, post.image, post.permalink, cached?.image, cached?.video === true, !authenticated.length, mediaId);
    const rest = { ...post };
    delete rest.video;
    const video = saved?.video || post.video || mediaId?.startsWith("urn:li:video:");
    return { ...rest, image: saved?.path, ...(video ? { video: true } : {}) };
  });

  for (const post of refreshedPosts.filter(hasContent)) previousPosts.set(post.id, post);
  const cachedPosts = recentPosts([...previousPosts.values()].filter(hasContent));

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
    const saved = await saveImage(`event-${id}`, null, event.link, previousEvents[event.link], false, false);
    if (saved) eventImages[event.link] = saved.path;
  });

  const calendarItems = carryCalendar(cachedPosts, previous.calendar);

  const snapshot = {
    ...previous,
    lastSyncedAt: authenticated.length || publicPosts.length || dashboard.length
      ? null
      : heartbeats.length ? new Date(Math.max(...heartbeats)).toISOString() : previous.lastSyncedAt,
    posts: cachedPosts,
    calendar: calendarItems,
    eventImages: Object.fromEntries(Object.entries(eventImages).sort(([a], [b]) => a.localeCompare(b))),
  };
  if (JSON.stringify(snapshot) !== JSON.stringify(previous)) {
    await writeFile(snapshotFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  }

  const used = new Set([
    ...cachedPosts.map((post) => post.image),
    ...Object.values(eventImages),
    ...calendarItems.map((item) => item.image),
  ].filter(Boolean).map((item) => item.slice("/linkedin/".length)));
  for (const name of await readdir(imageDir)) {
    if (/^(post|event)-[a-z0-9-]+\.(jpg|png|webp|avif)$/.test(name) && !used.has(name)) {
      await unlink(new URL(name, imageDir));
    }
  }
  console.log(`LinkedIn snapshot: ${cachedPosts.length} posts (newest ${newestLabel(cachedPosts)}), ${Object.keys(eventImages).length} event images`);
}
