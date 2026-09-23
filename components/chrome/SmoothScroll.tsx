"use client";

// Review: smooth page movement, using the Lenis reference from thoughts.txt.
/*
  Final pass 2026-09-23: the pinned scroll sections (the Home gallery, the
  Programmes stages) run on GSAP ScrollTrigger. Lenis moves the page on its own
  frame, so ScrollTrigger has to hear every Lenis scroll and both have to tick
  on the same clock, or a pinned section drifts a frame behind the page.
*/
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");
    let lenis: Lenis | undefined;
    const tick = (time: number) => lenis?.raf(time * 1000);
    const update = () => {
      lenis?.destroy();
      lenis = query.matches ? new Lenis({ autoRaf: false, anchors: true, allowNestedScroll: true, stopInertiaOnNavigate: true }) : undefined;
      lenis?.on("scroll", ScrollTrigger.update);
      ScrollTrigger.refresh();
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);
  return null;
}
