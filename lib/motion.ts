/*
  Change request 2026-09-21, second pass: "apply smoother transitions for all
  carousels".

  A rail's arrow buttons used scrollBy with behavior: "smooth". That curve
  belongs to the browser: it is short, it eases out hard, and it differs
  between engines, so the arrows moved at a speed nothing else on the page
  shares. This drives the scroll itself, on the same duration token and the
  same easing shape as every other transition in app/globals.css.

  No timing number is written here. The duration is read from --motion-rail on
  the element, so app/globals.css stays the one place a duration is declared.
*/

const FALLBACK_MS = 600;

function durationOf(node: HTMLElement): number {
  const raw = getComputedStyle(node).getPropertyValue("--motion-rail").trim();
  if (raw.endsWith("ms")) return Number.parseFloat(raw) || FALLBACK_MS;
  if (raw.endsWith("s")) return (Number.parseFloat(raw) || FALLBACK_MS / 1000) * 1000;
  return FALLBACK_MS;
}

/* The curve of --ease-glide: slow to leave, slow to arrive, quick between. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Scrolls a rail horizontally by `delta` pixels over --motion-rail.
 * Respects prefers-reduced-motion by jumping, and clamps to the scrollable
 * range so the last frame lands exactly on a snap position.
 */
export function glideBy(node: HTMLElement, delta: number) {
  const limit = node.scrollWidth - node.clientWidth;
  const from = node.scrollLeft;
  const to = Math.max(0, Math.min(limit, from + delta));
  if (to === from) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    node.scrollLeft = to;
    return;
  }

  const total = durationOf(node);
  const started = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - started) / total);
    node.scrollLeft = from + (to - from) * ease(progress);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
