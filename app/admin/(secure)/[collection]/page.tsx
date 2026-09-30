// Admin: add, view and remove one kind of content. Internal tooling, not a website surface.

import { notFound } from "next/navigation";

import { ContentCard } from "@/components/admin/ContentCard";
import { ItemForm } from "@/components/admin/ItemForm";
import { ItemPreview } from "@/components/admin/ItemPreview";
import { SendIssue } from "@/components/admin/SendIssue";
import { currentItems } from "@/lib/admin/builtins";
import { onDashboard } from "@/lib/admin/collections";
import { listSubscribers, type Item } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

/** Where each kind shows up on the public site, so an editor knows what adding one does. */
const shownOn: Record<string, string> = {
  newsletters: "Media page, Newsletters.",
  events: "Media page, Events calendar.",
  staff: "About page, Our team. Needs a portrait to appear.",
  cohorts: "MDI programme page, Success stories. Needs a photograph to appear.",
};

const detailOf = (item: Item) =>
  [item.start ?? item.date, item.role ?? item.year ?? item.issue ?? item.venue].filter(Boolean).join(" · ");

export default async function CollectionPage(props: PageProps<"/admin/[collection]">) {
  const { collection: id } = await props.params;
  // Review 2026-09-30: Posts and Upcoming activities are no longer managed here.
  const collection = onDashboard(id);
  if (!collection) notFound();
  const { shown, removed, saved } = await currentItems(collection.id);
  // The newsletter is the one collection that can be posted to the list.
  const subscribers = collection.id === "newsletters" ? (await listSubscribers("confirmed")).length : 0;
  const total = shown.length + saved.length;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 p-6 md:p-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-head text-ink">{collection.label}</h1>
        <p className="text-fine text-ink-3">Shown on: {shownOn[collection.id]}</p>
        <h2 className="kicker">Add a {collection.singular}</h2>
        <ItemForm collection={collection} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="kicker">On the website now: {total}</h2>
        {total === 0 ? <p className="text-body text-ink-3">Nothing is showing yet.</p> : null}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((item) => (
            <ContentCard key={item.id} collection={collection.id} id={item.id} source="dashboard"
              title={item[collection.titleField]} detail={detailOf(item)} image={item.image}>
              {item.pdf ? <a href={item.pdf} target="_blank" rel="noopener noreferrer" className="px-3 pb-2 text-fine text-brand">Open the PDF</a> : null}
              {collection.id === "newsletters" ? (
                <SendIssue id={item.id} subscribers={subscribers} sentAt={item.sentAt} sentCount={item.sentCount} />
              ) : null}
              <details className="border-t border-line-soft">
                <summary className="cursor-pointer px-3 py-2 text-fine text-brand">Preview on the site</summary>
                <div className="p-3 pt-0">
                  <ItemPreview collection={collection.id} values={item} />
                </div>
              </details>
            </ContentCard>
          ))}
          {shown.map((item) => (
            <ContentCard key={item.key} collection={collection.id} id={item.key} source="site"
              title={item.title} detail={item.detail} image={item.image} />
          ))}
        </ul>
      </section>

      {removed.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="kicker">Taken off the website: {removed.length}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {removed.map((item) => (
              <ContentCard key={item.key} collection={collection.id} id={item.key} source="site" restore
                title={item.title} detail={item.detail} image={item.image} />
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
