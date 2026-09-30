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

/*
  Review 2026-09-30: "check for bugging that may cause cards to stutter in
  horizontal scroll". Two things fought the frame-by-frame scroll below:

  - a rail with scroll-snap-type mandatory snaps every programmatic scrollLeft
    straight back to the nearest card, so the glide sat still until it passed
    halfway and then jumped a whole card;
  - a rail with scroll-behavior smooth turns every frame's assignment into a
    fresh browser animation, so each frame restarted the last one.

  Both are switched off on the element for the length of the glide and handed
  back once it lands exactly on the card. A new glide on the same rail cancels
  the one in flight, so the rotation timer and a tap cannot pull against each
  other.
*/
const inFlight = new WeakMap<HTMLElement, number>();

function release(node: HTMLElement) {
  node.style.removeProperty("scroll-snap-type");
  node.style.removeProperty("scroll-behavior");
}

/**
 * Scrolls a rail horizontally by `delta` pixels over --motion-rail.
 * Respects prefers-reduced-motion by jumping, and clamps to the scrollable
 * range so the last frame lands exactly on a snap position.
 */
export function glideBy(node: HTMLElement, delta: number) {
  const running = inFlight.get(node);
  if (running !== undefined) cancelAnimationFrame(running);

  const limit = node.scrollWidth - node.clientWidth;
  const from = node.scrollLeft;
  const to = Math.max(0, Math.min(limit, from + delta));
  if (to === from) {
    inFlight.delete(node);
    release(node);
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    node.scrollLeft = to;
    return;
  }

  node.style.scrollSnapType = "none";
  node.style.scrollBehavior = "auto";
  const total = durationOf(node);
  const started = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - started) / total);
    node.scrollLeft = from + (to - from) * ease(progress);
    if (progress < 1) {
      inFlight.set(node, requestAnimationFrame(step));
      return;
    }
    inFlight.delete(node);
    release(node);
  };
  inFlight.set(node, requestAnimationFrame(step));
}
