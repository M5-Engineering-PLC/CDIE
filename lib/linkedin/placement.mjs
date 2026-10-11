/* Fix plan 2026-10-11, W3: one placement per post; the newest override wins. */

import { calendarItem, classifyPost } from "./classify.mjs";
import { validDate } from "./dates.mjs";
import { linkedInUrn } from "./links.ts";

/** @typedef {{url: string, placement: 'calendar' | 'community' | 'hidden', date: string, at: string}} LinkedInOverride */

/** @param {string | undefined} url */
export function postKey(url) {
  return linkedInUrn(url) ?? url ?? "";
}

/** @param {Record<string, string>[]} rows @returns {LinkedInOverride[]} */
export function latestOverrides(rows) {
  /** @type {Map<string, LinkedInOverride>} */
  const latest = new Map();
  for (const row of rows) {
    const { url, placement, date = "", at } = row;
    if (!linkedInUrn(url) || !["calendar", "community", "hidden"].includes(placement)
      || !Number.isFinite(Date.parse(at)) || (date && !validDate(date))) continue;
    const key = postKey(url);
    if (latest.has(key) && Date.parse(latest.get(key).at) > Date.parse(at)) continue;
    latest.set(key, /** @type {LinkedInOverride} */ ({ url, placement, date, at }));
  }
  return [...latest.values()];
}

/** @template {import('./classify.mjs').Post} T @param {T[]} posts @param {import('./classify.mjs').CalendarItem[]} automatic @param {LinkedInOverride[]} overrides */
export function placePosts(posts, automatic, overrides) {
  const saved = new Map(overrides.map((row) => [postKey(row.url), row]));
  const calendar = new Map(automatic.map((item) => [postKey(item.link), item]));
  /** @type {Set<string>} */
  const excluded = new Set();
  /** @type {Set<string>} */
  const corrected = new Set();
  for (const post of posts) {
    const key = postKey(post.permalink);
    const override = saved.get(key);
    const placement = override?.placement ?? (classifyPost(post).kind === "community" ? "community" : "calendar");
    if (placement === "calendar") {
      const item = calendarItem(post, override?.date || null);
      if (item) calendar.set(key, item);
      if (override) corrected.add(key);
    } else {
      calendar.delete(key);
      if (override) excluded.add(key);
    }
  }
  const community = posts.filter((post) => {
    const key = postKey(post.permalink);
    return !calendar.has(key) && saved.get(key)?.placement !== "hidden";
  });
  return { calendar: [...calendar.values()], community, excluded, corrected };
}

/** @template {{id: string, link?: string}} T @param {T[]} items @param {Set<string>} [excluded] */
export function uniqueCalendar(items, excluded = new Set()) {
  const seen = new Set();
  return items.filter((item) => {
    const key = linkedInUrn(item.link);
    if (key && (seen.has(key) || excluded.has(key))) return false;
    if (key) seen.add(key);
    return true;
  });
}
