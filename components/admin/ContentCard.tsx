// Source: Fix plan 2026-10-11, D3 and D7. Collection controls change the local draft only.
export function ContentCard({ title, detail, image, source, hidden, changed, deleted, pending, onEdit, onDelete, onVisibility, children }: {
  title: string; detail?: string; image?: string; source: "site" | "dashboard";
  hidden: boolean; changed: boolean; deleted: boolean; pending: boolean;
  onEdit: () => void; onDelete: () => void; onVisibility: () => void; children?: React.ReactNode;
}) {
  return (
    <li className={`flex flex-col border border-line bg-surface ${hidden || deleted ? "opacity-70" : ""}`}>
      <div className="relative aspect-[4/3] bg-raise">
        {/* eslint-disable-next-line @next/next/no-img-element -- draft files have local preview URLs */}
        {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <span className="absolute inset-0 grid place-items-center text-fine text-ink-3">No image</span>}
        <span className="absolute left-2 top-2 bg-surface/90 px-2 py-0.5 font-mono text-fine uppercase tracking-wider text-ink-2">
          {changed ? "Not saved" : source === "dashboard" ? "Added here" : "Part of the site"}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-3">
        <div className={deleted ? "line-through" : ""}>
          <p className="text-body text-ink">{title}</p>
          {detail ? <p className="text-fine text-ink-3">{detail}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={pending || deleted} onClick={onEdit} className="text-fine text-brand disabled:opacity-50">Edit</button>
          <button type="button" disabled={pending || deleted} onClick={onVisibility} className="text-fine text-brand disabled:opacity-50">{hidden ? "Restore" : "Hide"}</button>
          {source === "dashboard" ? <button type="button" disabled={pending} onClick={onDelete} className="text-fine text-brand disabled:opacity-50">{deleted ? "Undo" : "Delete"}</button> : null}
        </div>
      </div>
      {children}
    </li>
  );
}
