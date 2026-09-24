"use client";

// Review: smooth page movement, using the Lenis reference from thoughts.txt.
/*
  Final pass 2026-09-23: the pinned scroll sections (the Home gallery, the
  Programmes stages) run on GSAP ScrollTrigger. Lenis moves the page on its own
  frame, so ScrollTrigger has to hear every Lenis scroll and both have to tick
  on the same clock, or a pinned section drifts a frame behind the page.
*/
/*
  2026-09-24: in-page links ("See what is on", the MDI index, the skip link)
  glide to their section on every device, not only where Lenis runs. The click
  is claimed in the capture phase and marked handled, so next/link does not
  also jump to the hash and cut the glide short. Both paths honour the
  section's scroll-margin and the page's scroll-padding, which clear the bar.
*/
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

function inPageTarget(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self")) return null;
  const url = new URL(link.href);
  if (!url.hash || url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return null;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  return target ? { target, hash: url.hash } : null;
}

export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    const tick = (time: number) => lenis?.raf(time * 1000);
    const update = () => {
      lenis?.destroy();
      lenis = query.matches ? new Lenis({ autoRaf: false, allowNestedScroll: true, stopInertiaOnNavigate: true }) : undefined;
      lenis?.on("scroll", ScrollTrigger.update);
      ScrollTrigger.refresh();
    };
    const onClick = (event: MouseEvent) => {
      const found = inPageTarget(event);
      if (!found) return;
      event.preventDefault();
      const { target, hash } = found;
      if (lenis) lenis.scrollTo(target);
      else target.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });
      if (location.hash !== hash) history.pushState(history.state, "", hash);
      // Keyboard and screen-reader users land where the eye does.
      if (!target.hasAttribute("tabindex") && !target.matches("a[href], button, input, select, textarea")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    update();
    query.addEventListener("change", update);
    window.addEventListener("click", onClick, true);
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("click", onClick, true);
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);
  return null;
}
