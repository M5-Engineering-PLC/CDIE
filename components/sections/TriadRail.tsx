// Section. Copy: HOME > What CDIE is. Lucid: Home, the three-word definition.
/*
  Change request 2026-09-21, section 2: "on mobile, what cdie is should also be
  a carousel".

  It is a carousel without a line of JavaScript. On a phone the list is a
  scroll-snapping row; from md it becomes the three-up grid it already was. The
  browser supplies the swipe, the inertia, the keyboard and the screen-reader
  behaviour, and there is no state to get out of step with the viewport.
*/

import Image from "next/image";

import { AutoRail } from "./AutoRail";

export type TriadItem = {
  id: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

export function TriadRail({ items }: { items: readonly TriadItem[] }) {
  return (
    <AutoRail className="rail -mx-gutter auto-cols-[78%] gap-px px-gutter md:mx-0 md:grid-flow-row md:auto-cols-auto md:grid-cols-3 md:overflow-visible md:bg-line md:px-0">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col border border-line bg-raise md:border-0">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 78vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-2 p-5 md:p-6">
            <h3 className="display text-sub text-brand">{item.title}</h3>
            <p className="text-body leading-relaxed text-ink-2">{item.body}</p>
          </div>
        </li>
      ))}
    </AutoRail>
  );
}
