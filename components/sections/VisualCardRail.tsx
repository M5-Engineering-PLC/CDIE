"use client";

// Beautify F05: fixed-size photographic capability cards, disclosure and continuous rail.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { glideBy } from "@/lib/motion";

export type VisualRailItem = {
  id: string; eyebrow: string; title: string; summary: string;
  /* changes-v2 item 5: a service with no photograph yet keeps its card and
     shows an empty frame rather than borrowing another area's picture. */
  image?: string; alt: string; href: string; action: string;
};

function CapabilityCard({ item, open, dismissed, clone, onToggle, onClose }: {
  item: VisualRailItem; open: boolean; dismissed?: boolean; clone?: boolean; onToggle?: () => void; onClose?: () => void;
}) {
  return (
    <li className={`capability-card ${open ? "is-open" : ""} ${dismissed ? "is-dismissed" : ""} ${clone ? "is-clone" : ""}`} aria-hidden={clone || undefined}>
      <div className="capability-photo">
        {item.image ? (
          <Image src={item.image} alt={clone ? "" : item.alt} fill sizes="(max-width: 480px) 88vw, 380px" className="capability-image object-cover" />
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
        <button id={`cap-toggle-${item.id}`} type="button" className="capability-hit" aria-label={`${open ? "Close" : "Show"} ${item.eyebrow} details`} aria-expanded={open} onClick={onToggle} />
      )}
      <div className="capability-detail">
        <h4>{item.title}</h4>
        <p>{item.summary}</p>
        <div className="capability-actions">
          {clone ? <span className="capability-action">{item.action}</span> : <Link href={item.href} className="capability-action group-hover:text-brand-live">{item.action}</Link>}
          {!clone && <button type="button" className="capability-close" onClick={() => { onClose?.(); document.getElementById(`cap-toggle-${item.id}`)?.focus(); }}>Close</button>}
        </div>
      </div>
    </li>
  );
}

export function VisualCardRail({ items, label }: { items: VisualRailItem[]; label: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const node = rail.current;
    if (!node || manual || inspecting || open || items.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = 0;
    const tick = (time: number) => {
      const clone = node.children[items.length] as HTMLElement | undefined;
      const first = node.firstElementChild as HTMLElement | null;
      const loop = clone && first ? clone.offsetLeft - first.offsetLeft : 0;
      if (last && loop && !document.hidden && node.dataset.visible === "true") {
        node.scrollLeft += Math.min(time - last, 40) * 0.028;
        if (node.scrollLeft >= loop) node.scrollLeft -= loop;
      }
      last = time;
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { node.dataset.visible = String(entry.isIntersecting); }, { threshold: 0.25 });
    observer.observe(node);
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [items.length, inspecting, manual, open]);

  const move = (direction: -1 | 1) => {
    const node = rail.current;
    const first = node?.firstElementChild as HTMLElement | null;
    const second = first?.nextElementSibling as HTMLElement | null;
    const clone = node?.children[items.length] as HTMLElement | undefined;
    if (!node || !first || !second || !clone) return;
    const step = second.offsetLeft - first.offsetLeft;
    const loop = clone.offsetLeft - first.offsetLeft;
    setManual(true);
    if (direction < 0 && node.scrollLeft < step) node.scrollLeft += loop;
    if (direction > 0 && node.scrollLeft >= loop) node.scrollLeft -= loop;
    glideBy(node, direction * step);
  };

  return (
    <div className="capability-gallery" onMouseEnter={() => setInspecting(true)} onMouseLeave={() => { setInspecting(false); setDismissed(null); }} onFocusCapture={() => setInspecting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInspecting(false); }} onKeyDown={(event) => { if (event.key === "Escape" && open) { setDismissed(open); setOpen(null); document.getElementById(`cap-toggle-${open}`)?.focus(); } }}>
      <ul ref={rail} aria-label={label} className="capability-rail">
        {items.map((item) => <CapabilityCard key={item.id} item={item} open={open === item.id} dismissed={dismissed === item.id} onToggle={() => { setDismissed(null); setOpen(open === item.id ? null : item.id); }} onClose={() => { setDismissed(item.id); setOpen(null); }} />)}
        {items.map((item) => <CapabilityCard key={`copy-${item.id}`} item={item} open={false} clone />)}
      </ul>
      {/* Final pass 2026-09-23: "remove the instructions in the pill". */}
      <div className="capability-controls">
        <button type="button" aria-label={`Previous ${label}`} onClick={() => move(-1)}>←</button>
        <button type="button" aria-label={`Next ${label}`} onClick={() => move(1)}>→</button>
      </div>
    </div>
  );
}
