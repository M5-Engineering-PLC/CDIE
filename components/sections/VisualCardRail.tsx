"use client";

// Review R8: visual cards reveal supporting information and link to full pages.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type VisualRailItem = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  href: string;
  action: string;
};

export function VisualCardRail({ items, label }: { items: VisualRailItem[]; label: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(true);
  const [end, setEnd] = useState(false);
  const measure = () => {
    const node = rail.current;
    if (!node) return;
    setStart(node.scrollLeft <= 2);
    setEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 2);
  };

  useEffect(() => {
    measure();
    const node = rail.current;
    if (!node) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const move = (direction: -1 | 1) => {
    const node = rail.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("li");
    node.scrollBy({ left: direction * ((card?.offsetWidth ?? node.clientWidth) + 20), behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-6 flex justify-end gap-2">
        <button type="button" aria-label={`Previous ${label}`} disabled={start} onClick={() => move(-1)} className="grid h-11 w-11 place-items-center border border-line bg-surface text-brand disabled:opacity-30">←</button>
        <button type="button" aria-label={`More ${label}`} disabled={end} onClick={() => move(1)} className="grid h-11 w-11 place-items-center border border-line bg-surface text-brand disabled:opacity-30">→</button>
      </div>
      <ul ref={rail} onScroll={measure} aria-label={label} className="grid snap-x snap-mandatory auto-cols-[82%] grid-flow-col gap-5 overflow-x-auto pb-4 sm:auto-cols-[46%] lg:auto-cols-[31%]">
        {items.map((item) => (
          <li key={item.id} className="card-hit group snap-start overflow-hidden border border-line bg-surface">
            <div className="relative aspect-[4/3] overflow-hidden"><Image src={item.image} alt={item.alt} fill sizes="(max-width: 768px) 82vw, 31vw" className="object-cover transition duration-500 group-hover:scale-105" /></div>
            <div className="flex min-h-64 flex-col p-6">
              <p className="kicker">{item.eyebrow}</p>
              <h3 className="display mt-3 text-sub">{item.title}</h3>
              <p className="mt-3 text-body leading-relaxed text-ink-2">{item.summary}</p>
              <Link href={item.href} className="stretch mt-auto pt-5 font-medium text-brand no-underline">{item.action} →</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
