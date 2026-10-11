/* Fix plan 2026-10-11, W3: pure classification, shared by sync and dashboard. */

import { dateFromText, postDate } from "./dates.mjs";

/** @typedef {{id: string, text: string, postedAt: string, permalink: string, title?: string, image?: string}} Post */
/** @typedef {{id: string, title: string, start: string, kind: string, link: string, image?: string}} CalendarItem */

/** @param {Post} post */
export function classifyPost(post) {
  const text = post.text ?? "";
  const date = dateFromText(text, post.postedAt);
  const time = /\b(?:\d{1,2}(?::\d{2})?\s*(?:am|pm)|\d{1,2}:\d{2})\b/i.test(text);
  const invitation = /\b(?:join us|register|rsvp|workshop|session)\b/i.test(text);
  const place = /(?:\b(?:venue|location|place)\s*:|📍|\b(?:turf|hall|garage|campus|auditorium|studio|centre|center|room|online|zoom)\b)/i.test(text);
  const eventLink = /https:\/\/(?:www\.)?linkedin\.com\/events\//i.test(`${text} ${post.permalink}`);
  const announcement = /\b(?:applications open|call for|now open|still open|deadline|rolling|apply now|apply by|apply here)\b/i.test(text);
  const kind = eventLink || ((date || time) && (invitation || place))
    ? "event" : announcement ? "announcement" : "community";
  return { kind, date };
}

/** @param {Post} post @param {string | null} [correction] @returns {CalendarItem | null} */
export function calendarItem(post, correction = null) {
  const automatic = classifyPost(post);
  const date = correction || automatic.date;
  const start = date || postDate(post.postedAt);
  if (!start) return null;
  return {
    id: `linkedin:${post.id}`,
    title: post.title || post.text.split(/\n/).find((line) => line.trim())?.trim() || post.id,
    start,
    // A posting date is never described as an event date.
    kind: automatic.kind === "event" && date ? "Event" : "Announcement",
    link: post.permalink,
    ...(post.image?.startsWith("/linkedin/") ? { image: post.image } : {}),
  };
}

/** @param {Post[]} posts @returns {CalendarItem[]} */
export function classifyCalendar(posts) {
  return posts.filter((post) => classifyPost(post).kind !== "community")
    .flatMap((post) => { const item = calendarItem(post); return item ? [item] : []; });
}
