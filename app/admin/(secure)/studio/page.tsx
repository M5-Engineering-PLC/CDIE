// Dashboard, Design Studio: each workshop area's photographs. Internal tooling, not a website surface.
/*
  Review 2026-09-30: "remove 3d view, remove highlighted in the room text
  section, only thing they can change is photographs, show current ones and a
  plus icon to add more images, change order, delete them". The room model is
  not editable, so it is no longer shown here.
*/

import Link from "next/link";

import { changeStudioPhotos } from "@/app/admin/studio-actions";
import { StudioPhotoAdd } from "@/components/admin/StudioPhotoAdd";
import { capabilities, defaultCapabilityId } from "@/content/studio";
import { studioPhotoOverrides } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

const control = "grid h-9 w-9 place-items-center border border-line bg-surface text-ink-2 transition-colors hover:border-brand hover:text-brand disabled:opacity-30";

function Control({ capability, index, op, label, disabled, children }: {
  capability: string; index: number; op: "up" | "down" | "delete"; label: string; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <form action={changeStudioPhotos}>
      <input type="hidden" name="capability" value={capability} />
      <input type="hidden" name="index" value={index} />
      <input type="hidden" name="op" value={op} />
      <button type="submit" aria-label={label} title={label} disabled={disabled} className={control}>{children}</button>
    </form>
  );
}

const icon = (d: string) => <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2"><path d={d} /></svg>;

export default async function AdminStudioPage(props: PageProps<"/admin/studio">) {
  const query = await props.searchParams;
  const selected = capabilities.find((item) => item.id === query.area) ?? capabilities.find((item) => item.id === defaultCapabilityId) ?? capabilities[0];
  const overrides = await studioPhotoOverrides();
  const photos = overrides[selected.id] ?? selected.media;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 p-6 md:p-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-head text-ink">Design Studio photographs</h1>
        <p className="max-w-[68ch] text-body text-ink-2">
          The first photograph leads: it is the workshop card&apos;s picture and the first one visitors see. Changes show on the Design Studio page within a few minutes.
        </p>
      </header>

      <nav aria-label="Workshop areas" className="flex flex-wrap gap-2">
        {capabilities.map((item) => (
          <Link
            key={item.id}
            href={`/admin/studio?area=${item.id}`}
            aria-current={item.id === selected.id ? "page" : undefined}
            className={`border px-3 py-1.5 text-fine transition-colors ${item.id === selected.id ? "border-brand bg-brand text-surface" : "border-line bg-surface text-ink-2 hover:border-brand"}`}
          >
            {item.name} <span className="opacity-70">({(overrides[item.id] ?? item.media).length})</span>
          </Link>
        ))}
      </nav>

      <section aria-label={`${selected.name} photographs`} className="flex flex-col gap-3">
        <h2 className="kicker">{selected.name}: {photos.length} photograph{photos.length === 1 ? "" : "s"}</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={`${photo.src}-${index}`} className="flex flex-col border border-line bg-surface">
              <div className="relative aspect-[4/3] bg-raise">
                {/* eslint-disable-next-line @next/next/no-img-element -- uploads are served by a route, not optimised */}
                <img src={photo.src} alt="" className="absolute inset-0 h-full w-full object-contain" />
                {index === 0 ? <span className="absolute left-2 top-2 bg-brand px-2 py-0.5 text-fine text-surface">Leads</span> : null}
              </div>
              <div className="flex items-center gap-2 p-3">
                <p className="min-w-0 flex-1 truncate text-fine text-ink-2" title={photo.alt}>{photo.alt}</p>
                <Control capability={selected.id} index={index} op="up" label="Move earlier" disabled={index === 0}>{icon("M15 18l-6-6 6-6")}</Control>
                <Control capability={selected.id} index={index} op="down" label="Move later" disabled={index === photos.length - 1}>{icon("M9 6l6 6-6 6")}</Control>
                <Control capability={selected.id} index={index} op="delete" label="Delete photograph" disabled={photos.length === 1}>{icon("M5 7h14M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3")}</Control>
              </div>
            </li>
          ))}
          <li><StudioPhotoAdd key={selected.id} capability={selected.id} name={selected.name} /></li>
        </ul>
      </section>
    </main>
  );
}
