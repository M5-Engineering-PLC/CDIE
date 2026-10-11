// Source: Fix plan 2026-10-11, D3 and D7. Collection pages compose the shared draft editor.
import { notFound } from "next/navigation";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { auditWho } from "@/lib/admin/audit";
import { collectionRecords } from "@/lib/admin/builtins";
import { onDashboard } from "@/lib/admin/collections";
import { listSubscribers } from "@/lib/admin/store";

export const dynamic = "force-dynamic";
const shownOn: Record<string, string> = {
  newsletters: "Media page, Newsletters.", events: "Media page, Events calendar.",
  staff: "About page, Our team. Needs a portrait to appear.", cohorts: "MDI programme page, Success stories. Needs a photograph to appear.",
};

export default async function CollectionPage(props: PageProps<"/admin/[collection]">) {
  const { collection: id } = await props.params;
  const collection = onDashboard(id);
  if (!collection) notFound();
  const [records, scope] = await Promise.all([collectionRecords(collection.id), auditWho()]);
  const subscribers = collection.id === "newsletters" ? (await listSubscribers("confirmed")).length : 0;
  return <main className="mx-auto flex max-w-6xl flex-col gap-10 p-6 md:p-10">
    <section className="flex flex-col gap-4">
      <h1 className="text-head text-ink">{collection.label}</h1>
      <p className="text-fine text-ink-3">Shown on: {shownOn[collection.id]}</p>
    </section>
    <CollectionEditor key={collection.id} collection={collection} records={records} subscribers={subscribers} scope={scope} />
  </main>;
}
