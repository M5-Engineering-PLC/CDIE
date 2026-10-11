/* Fix plan 2026-10-11, D3 and D7: built-in fields and dashboard records share the draft editor. */
import { people } from "@/content/about";
import { mediaItems } from "@/content/media";
import { events, mdiGraduands } from "@/content/programmes";

import { collectionById, type CollectionId } from "./collections";
import { recordStamp, type CollectionRecord, type Fields } from "./collectionDraft";
import { newestOverrides } from "./overrides";
import { collectionData, type Item } from "./store";

export type ListedItem = { key: string; title: string; detail: string; image?: string; source: "site" | "dashboard"; fields: Fields };

export function siteItems(collection: CollectionId): ListedItem[] {
  const site = (key: string, fields: Fields): ListedItem => ({ key, fields, title: fields.name ?? fields.title, detail: [fields.start, fields.role ?? fields.year ?? fields.issue ?? fields.venue].filter(Boolean).join(" · "), image: fields.image, source: "site" });
  switch (collection) {
    case "newsletters":
      return mediaItems.filter((item) => item.kind === "newsletter")
        .map((item) => site(item.id, { title: item.title, issue: item.issue ?? item.date ?? "", summary: item.summary, image: item.cover?.src ?? "", pdf: item.external ?? "" }));
    case "events":
      return events.map((event) => site(event.id, { title: event.title, start: event.start, end: event.end ?? "", venue: event.venue ?? "", link: event.link ?? "", image: event.image ?? "", summary: "" }));
    case "staff":
      return people.map((person) => site(person.id, { name: person.name, role: person.role, image: person.portrait?.src ?? "" }));
    case "cohorts":
      return mdiGraduands.map((person) => site(person.id, { name: person.name, year: person.cohort, summary: person.quote ?? "", image: person.image, linkedin: person.linkedin ?? "" }));
    default: return [];
  }
}

export async function collectionRecords(collection: CollectionId, fresh = false): Promise<CollectionRecord[]> {
  const { items, hidden, overrides: rows } = await collectionData(collection, fresh);
  const overrides = newestOverrides(collection, rows);
  const version = (id: string) => hidden.filter((row) => row.key === id).map((row) => row.at).sort().join(",");
  const removed = (id: string) => hidden.some((row) => row.key === id);
  const sites: CollectionRecord[] = siteItems(collection).map((item) => {
    const fields = { ...item.fields, ...overrides[item.key]?.fields };
    return { id: item.key, source: "site", fields, original: item.fields, hidden: removed(item.key), base: recordStamp(fields, removed(item.key), `${overrides[item.key]?.at ?? ""}:${version(item.key)}`) };
  });
  return [...items.map((item): CollectionRecord => ({ id: item.id, source: "dashboard", fields: item, hidden: removed(item.id), base: recordStamp(item, removed(item.id), version(item.id)) })), ...sites];
}

/** Overview counts use the same effective records that the editor displays. */
export async function currentItems(collection: CollectionId) {
  const records = await collectionRecords(collection);
  const definition = collectionById(collection)!;
  const site = (record: CollectionRecord): ListedItem => ({ key: record.id, title: record.fields[definition.titleField], detail: record.fields.role ?? record.fields.year ?? record.fields.issue ?? record.fields.start ?? "", image: record.fields.image, source: "site", fields: record.fields });
  return {
    shown: records.filter((item) => item.source === "site" && !item.hidden).map(site),
    removed: records.filter((item) => item.source === "site" && item.hidden).map(site),
    saved: records.filter((item) => item.source === "dashboard" && !item.hidden).map((item) => item.fields as Item),
  };
}
