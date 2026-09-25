// Admin: add and remove one kind of content. Internal tooling, not a website surface.

import { notFound } from "next/navigation";

import { deleteItem } from "@/app/admin/actions";
import { ItemForm } from "@/components/admin/ItemForm";
import { ItemPreview } from "@/components/admin/ItemPreview";
import { SendIssue } from "@/components/admin/SendIssue";
import { collectionById } from "@/lib/admin/collections";
import { listItems, listSubscribers } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

/** Where each kind shows up on the public site, so an editor knows what adding one does. */
const shownOn: Record<string, string> = {
  newsletters: "Media page, Newsletters, alongside the published issues.",
  events: "Media page, Events calendar.",
  activities: "Media page, Events calendar, labelled as an activity.",
  posts: "Media page, Events calendar, labelled as a post.",
  staff: "About page, Our team. Needs a portrait to appear.",
  cohorts: "MDI programme page, Success stories. Needs a photograph to appear.",
};

export default async function CollectionPage(props: PageProps<"/admin/[collection]">) {
  const { collection: id } = await props.params;
  const collection = collectionById(id);
  if (!collection) notFound();
  const items = await listItems(collection.id);
  // The newsletter is the one collection that can be posted to the list.
  const subscribers = collection.id === "newsletters" ? (await listSubscribers("confirmed")).length : 0;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 p-6 md:p-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-head text-ink">{collection.label}</h1>
        <p className="text-fine text-ink-3">Shown on: {shownOn[collection.id]}</p>
        <h2 className="kicker">Add a {collection.singular}</h2>
        <ItemForm collection={collection} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="kicker">{items.length} saved</h2>
        {items.length === 0 ? <p className="text-body text-ink-3">Nothing added yet.</p> : null}
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const image = item.image;
            return (
              <li key={item.id} className="border border-line bg-surface">
                <div className="flex items-center gap-4 p-3">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- uploads are served by a route, not optimised
                  <img src={image} alt="" className="h-14 w-20 shrink-0 object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body text-ink">{item[collection.titleField]}</p>
                  <p className="truncate text-fine text-ink-3">
                    {[item.start ?? item.date, item.role ?? item.programme ?? item.issue ?? item.venue].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {item.pdf ? (
                  <a href={item.pdf} target="_blank" rel="noopener noreferrer" className="text-fine text-brand">PDF</a>
                ) : null}
                <form action={deleteItem}>
                  <input type="hidden" name="collection" value={collection.id} />
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-fine text-ink-3 hover:text-brand">Remove</button>
                </form>
                </div>
                {collection.id === "newsletters" ? (
                  <SendIssue id={item.id} subscribers={subscribers} sentAt={item.sentAt} sentCount={item.sentCount} />
                ) : null}
                <details className="border-t border-line-soft">
                  <summary className="cursor-pointer px-3 py-2 text-fine text-brand">Preview on the site</summary>
                  <div className="p-3 pt-0">
                    <ItemPreview collection={collection.id} values={item} />
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
