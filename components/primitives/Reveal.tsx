"use client";

// Transitions branch 2026-09-29: a section's content rises into place once, as it scrolls into view.
/*
  The server renders the content fully visible. Only after hydration, and only
  for a block that starts below the fold, is it set back and then released
  when it enters the viewport. So a reader with no script, a crawler, or a
  block already on screen at first paint never sees anything blink out.

  One shot: once revealed it stays revealed, and scrolling back up does not
  replay it. Reduced motion skips the whole thing. Timing comes from the
  --motion-scene and --ease-glide tokens in app/globals.css; the state is a
  data attribute written straight to the node, so no re-render is involved.
*/

import { useEffect, useRef, type ReactNode } from "react";

export type RevealProps = {
  children: ReactNode;
  className?: string;
};

export function Reveal({ children, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    node.dataset.reveal = "wait";
    const release = () => {
      node.dataset.reveal = "in";
      observer.disconnect();
      node.removeEventListener("focusin", release);
    };
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) release(); },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    // Keyboard focus can land in a block faster than the observer reports it
    // on screen; a focused control must never sit inside a transparent block.
    node.addEventListener("focusin", release);

    return () => {
      observer.disconnect();
      node.removeEventListener("focusin", release);
      delete node.dataset.reveal;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,translate] duration-(--motion-scene) ease-(--ease-glide) data-[reveal=wait]:translate-y-5 data-[reveal=wait]:opacity-0 print:translate-y-0 print:opacity-100 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
