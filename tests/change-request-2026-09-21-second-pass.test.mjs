/*
  The second pass of the 2026-09-21 change request. Where it reverses the
  first pass, the first pass's test was narrowed to what survived and the
  reversal is asserted here, so the two files never claim opposite things.
*/

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

test("the bar is white, LOGIN has no pill, and Contact is in it", () => {
  // Enhancements 2026-09-22: "navbar-white", "remove pill on navbar".
  /* The bar's colours moved into .site-nav in app/globals.css with the
     navbar-transition work, so the white ground is asserted there. */
  const nav = read("components/chrome/SiteNav.tsx");
  assert.doesNotMatch(nav, /bg-brand\/95/);
  const css = read("app/globals.css");
  assert.match(css, /\.site-nav \{[^}]*background: rgb\(255 255 255/);
  assert.match(css, /\.site-nav-link:hover[^{]*\{[^}]*color: var\(--color-brand\)/);
  assert.match(read("components/chrome/NavPanel.tsx"), /bg-surface lg:hidden/);

  const site = read("content/site.ts");
  assert.match(site, /\{ label: "Contact", href: "\/contact" \}/);
  // Lucid's order: Contact is the last item before LOGIN
  const items = [...site.matchAll(/\{ label: "([^"]+)", href: "\/[a-z-]*" \}/g)].map((m) => m[1]);
  assert.equal(items.at(-1), "Contact");
});

test("every carousel eases rather than cuts", () => {
  const css = read("app/globals.css");
  assert.match(css, /--motion-rail:/);
  assert.match(css, /@keyframes settle/);

  // the arrow-driven rails glide on the token, not on the browser's own curve
  const motion = read("lib/motion.ts");
  assert.match(motion, /--motion-rail/);
  assert.match(motion, /prefers-reduced-motion/);
  for (const path of ["components/sections/VisualCardRail.tsx", "components/sections/CardRail.tsx"]) {
    assert.match(read(path), /glideBy/, path);
    assert.doesNotMatch(read(path), /behavior: "smooth"/, path);
  }

  // the stepped carousels animate the arriving slide instead of swapping it
  assert.match(read("components/sections/Carousel.tsx"), /"settle"/);
  assert.match(read("components/sections/SoloCardCarousel.tsx"), /settle flex flex-col/);
  // the scrolled one eases its own scrolling
  // Final pass 2026-09-23: the LinkedIn band is a fan whose cards glide on --motion-scene.
  assert.match(css, /\.fan-card \{[^}]*transition: transform var\(--motion-scene\)/);
});

test("What CDIE is is the lettering again, with no button under it", () => {
  const home = read("app/(site)/page.tsx");
  assert.match(home, /C\.D\.I\.E/);
  assert.doesNotMatch(home, /defineCdie\.image/);
  assert.doesNotMatch(home, /defineCdie\.action/);

  const content = read("content/home.ts");
  // neither key is left declared and unread
  assert.doesNotMatch(content, /label: "Meet CDIE"/);
  assert.doesNotMatch(content, /Each one opens the studio at that service/);
  // the three words keep their pictures
  assert.match(content, /id: "innovate"[\s\S]*image: "\/images\//);
});

test("an explore link answers a pointer", () => {
  const rail = read("components/sections/VisualCardRail.tsx");
  assert.match(rail, /group-hover:text-brand-live/);
  // text-brand is a utility class, so the site-wide a:hover rule cannot win
  assert.match(rail, /hover:text-brand-live/);
  assert.match(read("app/globals.css"), /\.card-hit:hover \{[\s\S]*transform: translateY/);
});

test("the programme carousel reads the client's five names", () => {
  const programmes = read("content/programmes.ts");
  const names = [...programmes.matchAll(/carouselTitle: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(names, [
    "Invention education",
    "MSc MDI",
    "Design challenges",
    "Catalyst grants",
    "Training and masterclasses",
  ]);
  assert.match(read("app/(site)/programmes/page.tsx"), /eyebrow: opportunity\.carouselTitle/);
});

test("the questions band is FAQs and carries no subtitle", () => {
  const page = read("app/(site)/programmes/page.tsx");
  assert.match(page, /<Section tone="surface" eyebrow="FAQs">/);
  assert.doesNotMatch(page, /Before you enquire/);
});

test("no FAQ answer publishes without a named confirmation", () => {
  // the field is required, so the decision cannot be defaulted past
  assert.match(read("content/types.ts"), /confirmed: FaqConfirmation \| null;/);

  const list = read("components/blocks/FaqList.tsx");
  assert.match(list, /faq\.confirmed \?/);
  assert.match(list, /being confirmed with the team/);

  for (const path of ["content/programmes.ts", "content/studio.ts"]) {
    const source = path === "content/programmes.ts" ? "programmeFaqs" : "studioFaqs";
    const block = read(path).split(`export const ${source}: Faq[] = [`)[1].split("\n];")[0];
    const questions = [...block.matchAll(/question: /g)].length;
    const confirmations = [...block.matchAll(/confirmed: /g)].length;
    assert.ok(questions > 0, path);
    assert.equal(confirmations, questions, `${path}: every question states its confirmation`);
  }
});

test("About Us opens with a picture and has no cohorts band", () => {
  const page = read("app/(site)/about/page.tsx");
  assert.match(page, /image=\{aboutIntro\.image\}/);
  assert.doesNotMatch(page, /id="cohorts"/);
  assert.doesNotMatch(page, /cohortsPointer/);

  const content = read("content/about.ts");
  assert.match(content, /image: \{\n    src: "\/images\//);
  assert.doesNotMatch(content, /export const cohortsPointer/);
});
