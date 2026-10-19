// Lucid: Design Studio virtual tour. Prepares the 3D tour at idle so opening it does not freeze the page.
import { preloadAtc3D, preloadDesignStudio3D } from "./preloadStudio3D";
import { studio3DWarmPlan } from "./studio3DWarmPlan";

/*
  Review 2026-10-19: a visitor who lands on any public page and later opens the
  Design Studio tour should see it start at once. After the page has loaded and
  gone idle, this fetches the 3D code (three.js and both rooms) and then, one
  idle slice at a time, builds and compiles each room on the site's one shared
  renderer. It replaces nothing on the page and draws nothing on screen.

  The 2026-10-01 warm-up mounted both rooms at once, each with its own renderer
  on a hidden canvas, and caused lag and a flash; ce8cf69 removed it. This does
  not mount anything, uses one renderer, and yields between every stage.
*/
type IdleWindow = Window & {
  requestIdleCallback?: (callback: (deadline: IdleDeadline) => void, options?: { timeout: number }) => number;
};

const INPUTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"];
let lastInput = 0;
const noteInput = () => { lastInput = performance.now(); };

/*
  Resolves in an idle period. A page that animates every frame never offers a
  long idle period, so a short one is accepted once the visitor has not
  scrolled, typed or touched for half a second. Without idle callbacks, a timer.
*/
function idle(budget = 40) {
  const asked = performance.now();
  return new Promise<void>((resolve) => {
    const browser = window as IdleWindow;
    if (!browser.requestIdleCallback) {
      window.setTimeout(resolve, 200);
      return;
    }
    const check = (deadline: IdleDeadline) => {
      const now = performance.now();
      const settled = now - asked > 250 && now - lastInput > 500;
      if (deadline.timeRemaining() >= budget || settled) resolve();
      else browser.requestIdleCallback!(check);
    };
    browser.requestIdleCallback(check);
  });
}

/** Ends the current task so input and paint can run before the next stage. */
const pause = () => new Promise<void>((resolve) => window.setTimeout(resolve));

const loaded = () => new Promise<void>((resolve) => {
  if (document.readyState === "complete") resolve();
  else window.addEventListener("load", () => resolve(), { once: true });
});

let warming: Promise<void> | undefined;

async function warm() {
  const plan = studio3DWarmPlan();
  if (plan === "none") return;
  INPUTS.forEach((type) => window.addEventListener(type, noteInput, { passive: true, capture: true }));
  try {
    await loaded();
    await idle();
    const [studio, atc] = await Promise.all([preloadDesignStudio3D(), preloadAtc3D()]);
    performance.mark("studio-3d:code");
    if (plan !== "scenes") return;
    await studio.warmDesignStudio3D({ idle, pause });
    await atc.warmAtc3D({ idle, pause });
  } finally {
    INPUTS.forEach((type) => window.removeEventListener(type, noteInput, { capture: true }));
  }
}

/** Start the warm-up once per page load. Safe to call again: it returns the same promise. */
export function warmStudio3D() {
  if (typeof window === "undefined") return Promise.resolve();
  warming ??= warm().catch(() => {});
  return warming;
}
