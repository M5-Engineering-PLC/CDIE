// Dashboard: one record as a card, with its remove (or restore) control. Internal tooling.
/*
  Review 2026-09-30: "can view, remove the current ones already in the website;
  current cards are listed below the add form". A record added in the
  dashboard is deleted; one that ships with the site is hidden and can be
  restored, so nothing that came with the site is lost to a stray click.
*/

import { deleteItem, hideItem } from "@/app/admin/actions";

export function ContentCard({ collection, id, title, detail, image, source, restore = false, children }: {
  collection: string;
  /** the saved record's id, or the site record's key */
  id: string;
  title: string;
  detail?: string;
  image?: string;
  source: "site" | "dashboard";
  restore?: boolean;
  children?: React.ReactNode;
}) {
  const action = source === "dashboard" ? deleteItem : hideItem;
  const verb = restore ? "Restore" : source === "dashboard" ? "Delete" : "Remove from site";

  return (
    <li className={`flex flex-col border border-line bg-surface ${restore ? "opacity-70" : ""}`}>
      <div className="relative aspect-[4/3] bg-raise">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- uploads are served by a route, not optimised
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-fine text-ink-3">No image</span>
        )}
        <span className="absolute left-2 top-2 bg-surface/90 px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-wider text-ink-2">
          {source === "dashboard" ? "Added here" : "Part of the site"}
        </span>
      </div>
      <div className="flex flex-1 items-start gap-3 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-body text-ink">{title}</p>
          {detail ? <p className="text-fine text-ink-3">{detail}</p> : null}
        </div>
        <form action={action}>
          <input type="hidden" name="collection" value={collection} />
          <input type="hidden" name={source === "dashboard" ? "id" : "key"} value={id} />
          {restore ? <input type="hidden" name="restore" value="yes" /> : null}
          <button type="submit" className={`shrink-0 text-fine ${restore ? "text-brand" : "text-ink-3 hover:text-brand"}`}>{verb}</button>
        </form>
      </div>
      {children}
    </li>
  );
}
