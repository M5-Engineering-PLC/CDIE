"use client";

// Review: smooth page movement, using the Lenis reference from thoughts.txt.
import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");
    let lenis: Lenis | undefined;
    const update = () => {
      lenis?.destroy();
      lenis = query.matches ? new Lenis({ autoRaf: true, anchors: true, allowNestedScroll: true, stopInertiaOnNavigate: true }) : undefined;
    };
    update();
    query.addEventListener("change", update);
    return () => { query.removeEventListener("change", update); lenis?.destroy(); };
  }, []);
  return null;
}
