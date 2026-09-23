/*
  The content the admin dashboard manages, and the fields each kind carries.

  Enhancements 2026-09-22, Dashboard: "posts, newsletter, event, upcoming
  activity, staff, cohorts". One definition drives the form, the list and the
  store, so adding a field is an edit here and nowhere else.
*/

export type FieldType = "text" | "textarea" | "date" | "url" | "image" | "pdf";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
};

export type CollectionId = "posts" | "newsletters" | "events" | "activities" | "staff" | "cohorts";

export type Collection = {
  id: CollectionId;
  label: string;
  singular: string;
  /** the field shown as the row title in the dashboard list */
  titleField: string;
  fields: Field[];
};

export const collections: Collection[] = [
  /* Final pass 2026-09-23: "change Media section to 'Posts'; all mentions of
     Media". The store reads records saved under the old "media" key as posts. */
  {
    id: "posts",
    label: "Posts",
    singular: "post",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "date", label: "Date", type: "date" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "image", label: "Photograph", type: "image" },
      { name: "link", label: "Link", type: "url", hint: "Optional. Where the item is published." },
    ],
  },
  {
    id: "newsletters",
    label: "Newsletters",
    singular: "newsletter issue",
    titleField: "title",
    fields: [
      { name: "issue", label: "Issue label", type: "text", required: true, hint: "For example: Issue 7" },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "image", label: "Cover image", type: "image", required: true, hint: "Use a landscape photo at least 1200 pixels wide; avoid small thumbnails." },
      { name: "pdf", label: "Newsletter PDF", type: "pdf", required: true },
    ],
  },
  {
    id: "events",
    label: "Events",
    singular: "event",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "start", label: "Start date", type: "date", required: true },
      { name: "end", label: "End date", type: "date" },
      { name: "venue", label: "Venue", type: "text" },
      { name: "summary", label: "Summary", type: "textarea" },
    ],
  },
  {
    id: "activities",
    label: "Upcoming activities",
    singular: "upcoming activity",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "start", label: "Date", type: "date", required: true },
      { name: "end", label: "End date", type: "date" },
      { name: "venue", label: "Where", type: "text" },
      { name: "summary", label: "Summary", type: "textarea" },
    ],
  },
  {
    id: "staff",
    label: "Staff",
    singular: "staff member",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "image", label: "Portrait", type: "image" },
      { name: "bio", label: "Short bio", type: "textarea" },
    ],
  },
  {
    id: "cohorts",
    label: "Cohorts",
    singular: "cohort",
    titleField: "name",
    fields: [
      { name: "name", label: "Cohort name", type: "text", required: true },
      { name: "programme", label: "Programme", type: "text", required: true },
      { name: "year", label: "Year", type: "text" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "image", label: "Photograph", type: "image" },
    ],
  },
];

export const collectionById = (id: string) => collections.find((item) => item.id === id);
