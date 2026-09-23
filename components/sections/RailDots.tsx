"use client";

/*
  changes-v2, items 2, 10, 24 and 27: "show existence of multiple cards using
  the pagination dots, active being larger coloured dot".

  One control for every rail on the site. It reads the rail it is given: a dot
  per card, the dot for the card in view larger and in brand, and a tap on a dot
  scrolls that card into view. A rail whose cards all fit shows nothing, so the
  dots appear exactly where there is something more to see.
*/

import { useEffect, useState, type RefObject } from "react";

import { glideBy } from "@/lib/motion";

export function RailDots({
  rail,
  count,
  label = "cards",
}: {
  rail: RefObject<HTMLElement | null>;
  count: number;
  label?: string;
}) {
  const [active, setActive] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    const measure = () => {
      const limit = node.scrollWidth - node.clientWidth;
      setScrollable(limit > 2);
      setActive(limit > 2 ? Math.round((node.scrollLeft / limit) * (count - 1)) : 0);
    };
    /* After paint, so the first measurement never renders twice in a row, and
       again once fonts and images have settled: a rail measured too early can
       still report that everything fits. */
    const first = requestAnimationFrame(measure);
    const settled = window.setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    node.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => {
      cancelAnimationFrame(first);
      window.clearTimeout(settled);
      window.removeEventListener("resize", measure);
      node.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [count, rail]);

  if (count < 2 || !scrollable) return null;

  return (
    <ol className="mt-4 flex items-center justify-center gap-2">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex">
          <button
            type="button"
            aria-label={`Show ${label} ${index + 1} of ${count}`}
            aria-current={index === active}
            onClick={() => {
              const node = rail.current;
              const card = node?.children[index] as HTMLElement | undefined;
              if (node && card) glideBy(node, card.offsetLeft - node.scrollLeft - node.offsetLeft);
            }}
            className={`rounded-full transition-all duration-300 ${
              index === active ? "h-3 w-3 bg-brand" : "h-2 w-2 bg-line hover:bg-brand-lift"
            }`}
          />
        </li>
      ))}
    </ol>
  );
}
