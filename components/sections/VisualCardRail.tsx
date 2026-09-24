"use client";

// Beautify F05: fixed-size photographic capability cards, disclosure and continuous rail.
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useLoopRail } from "./useLoopRail";

export type VisualRailItem = {
  id: string; eyebrow: string; title: string; summary: string;
  /* changes-v2 item 5: a service with no photograph yet keeps its card and
     shows an empty frame rather than borrowing another area's picture. */
  image?: string; alt: string; href: string; action: string;
};

function CapabilityCard({ item, open, clone, onToggle, onLeave }: {
  item: VisualRailItem; open: boolean; clone?: boolean; onToggle?: () => void; onLeave?: () => void;
}) {
  return (
    <li className={`capability-card ${open ? "is-open" : ""} ${clone ? "is-clone" : ""}`} aria-hidden={clone || undefined} onMouseLeave={onLeave}>
      <div className="capability-photo">
        {item.image ? (
          <Image src={item.image} alt={clone ? "" : item.alt} fill sizes="(max-width: 480px) 88vw, 380px" className="capability-image object-cover" draggable={false} />
        ) : (
          <span className="capability-image block h-full w-full bg-raise" aria-hidden="true" />
        )}
      </div>
      {/* Final pass 2026-09-23: "remove the 'Explore +' button in the studio
          cards". The label alone sits on the card; the whole card is the
          control that opens it, so a phone (no hover) can still reach it. */}
      <div className="capability-caption">
        <h3>{item.eyebrow}</h3>
      </div>
      {clone ? null : (
        <button id={`cap-toggle-${item.id}`} type="button" className="capability-hit" aria-label={`${open ? "Hide" : "Show"} ${item.eyebrow} details`} aria-expanded={open} onClick={onToggle} />
      )}
      {/* 2026-09-24: hovering shows the details and the explore button; the
          Close button is gone. Leaving the card, or tapping it again, hides them. */}
      <div className="capability-detail">
        <h4>{item.title}</h4>
        <p>{item.summary}</p>
        <div className="capability-actions">
          {clone ? <span className="capability-action">{item.action}</span> : <Link href={item.href} className="capability-action group-hover:text-brand-live">{item.action}</Link>}
        </div>
      </div>
    </li>
  );
}

export function VisualCardRail({ items, label }: { items: VisualRailItem[]; label: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const { active, goTo } = useLoopRail(rail, items.length, inspecting || open !== null);

  return (
    <div className="capability-gallery" onMouseEnter={() => setInspecting(true)} onMouseLeave={() => setInspecting(false)} onFocusCapture={() => setInspecting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInspecting(false); }} onKeyDown={(event) => { if (event.key === "Escape" && open) { document.getElementById(`cap-toggle-${open}`)?.focus(); setOpen(null); } }}>
      <ul ref={rail} aria-label={label} className="capability-rail">
        {items.map((item) => <CapabilityCard key={item.id} item={item} open={open === item.id} onToggle={() => setOpen(open === item.id ? null : item.id)} onLeave={() => setOpen((current) => (current === item.id ? null : current))} />)}
        {items.map((item) => <CapabilityCard key={`copy-${item.id}`} item={item} open={false} clone />)}
      </ul>
      {/* 2026-09-24: centred pagination dots replace the right-aligned arrows. */}
      <div className="capability-dots" role="group" aria-label={`Choose from ${label}`}>
        {items.map((item, index) => (
          <button key={item.id} type="button" aria-label={`Show ${item.eyebrow}`} aria-current={active === index ? "true" : undefined} onClick={() => goTo(index)} />
        ))}
      </div>
    </div>
  );
}
