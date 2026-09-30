/*
  Review 2026-09-30, dashboard: "can view, remove the current ones already in
  the website". The records that ship in content/ are listed here in one shape
  the dashboard can draw beside the ones it saved itself. Removing one hides it
  (lib/admin/store.ts, hideBuiltIn); the record stays in the code.

  Each key is the record's own id, the same id the public page filters on, so
  a hide here and the filter there cannot disagree.
*/

import { people } from "@/content/about";
import { mediaItems } from "@/content/media";
import { events, mdiGraduands } from "@/content/programmes";

import type { CollectionId } from "./collections";
import { hiddenKeys, listItems } from "./store";

export type ListedItem = {
  key: string;
  title: string;
  detail: string;
  image?: string;
  /** "site" records live in content/ and are hidden; "dashboard" records are deleted. */
  source: "site" | "dashboard";
};

export function siteItems(collection: CollectionId): ListedItem[] {
  const site = (key: string, title: string, detail: string, image?: string): ListedItem => ({ key, title, detail, image, source: "site" });
  switch (collection) {
    case "newsletters":
      return mediaItems
        .filter((item) => item.kind === "newsletter")
        .map((item) => site(item.id, item.title, item.issue ?? item.date ?? "", item.cover?.src));
    case "events":
      return events.map((event) => site(event.id, event.title, [event.start, event.venue].filter(Boolean).join(" · "), event.image));
    case "staff":
      return people.map((person) => site(person.id, person.name, person.role, person.portrait?.src));
    case "cohorts":
      return mdiGraduands.map((person) => site(person.id, person.name, person.cohort, person.image));
    default:
      return [];
  }
}

/** What is on the website now for one collection, and what the dashboard has taken off it. */
export async function currentItems(collection: CollectionId) {
  const [hidden, saved] = await Promise.all([hiddenKeys(), listItems(collection)]);
  const own = siteItems(collection);
  return {
    shown: own.filter((item) => !hidden.has(`${collection}:${item.key}`)),
    removed: own.filter((item) => hidden.has(`${collection}:${item.key}`)),
    saved,
  };
}
