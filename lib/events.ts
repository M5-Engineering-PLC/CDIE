// Lucid: Media > Events Calendar. One timeline, read by Media and Programmes alike.

import type { CalendarCardEvent } from "@/components/blocks/EventCalendar";
import snapshot from "@/content/linkedin-snapshot.json";
import { events } from "@/content/programmes";
import { hiddenKeys, listItems } from "@/lib/admin/store";
import { openingIndex } from "@/lib/eventWindow";

/* The scheduled sync commits LinkedIn pictures into /public/linkedin. Rendering
   never waits for LinkedIn or sends its image URLs to a browser. */
const withPostImage = (event: CalendarCardEvent) => {
  const image = event.image?.startsWith("https://media.licdn.com/") ? undefined : event.image;
  if (image || !event.link?.startsWith("https://www.linkedin.com/")) return { ...event, image };
  return { ...event, image: (snapshot.eventImages as Record<string, string>)[event.link] };
};

/* Enhancements 2026-09-22: one timeline holds programme events plus the
   events, upcoming activities and posts added in the admin dashboard.
   Review 2026-09-30: events removed in the dashboard leave the timeline. */
export async function getCalendarEvents(): Promise<CalendarCardEvent[]> {
  const [added, activities, posts, hidden] = await Promise.all([
    listItems("events"),
    listItems("activities"),
    listItems("posts"),
    hiddenKeys(),
  ]);
  return [
    ...events
      .filter((event) => !hidden.has(`events:${event.id}`))
      .map((event) => ({
        id: event.id, title: event.title, start: event.start, end: event.end, kind: event.kind,
        venue: event.venue, estimated: event.estimated, link: event.link, image: event.image,
      })),
    ...added.map((item) => ({ id: item.id, title: item.title, start: item.start, end: item.end, venue: item.venue, kind: "Event", image: item.image })),
    ...activities.map((item) => ({ id: item.id, title: item.title, start: item.start, end: item.end, venue: item.venue, kind: "Activity", image: item.image })),
    ...posts.map((item) => ({ id: item.id, title: item.title, start: item.date || item.createdAt.slice(0, 10), kind: "Post", link: item.link, image: item.image })),
  ].map(withPostImage);
}

/** The cards the Media calendar opens on: upcoming first, then the most recent. */
export function recentEvents(items: CalendarCardEvent[], today: string, count = 3) {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start));
  const from = openingIndex(sorted.map((event) => event.start), today, count);
  return sorted.slice(from, from + count);
}
