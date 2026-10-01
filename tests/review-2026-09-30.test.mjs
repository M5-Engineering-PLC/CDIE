/*
  Review of 30 September 2026. Each test names the review item it holds in
  place, in the reviewer's words where they were quoted.
*/

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { captionText } from "../lib/linkedin/caption.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

test("community captions carry words only: no emoji, no hashtags", () => {
  assert.equal(captionText("Great week 🎉👏🏽 at #CDIE! 🇰🇪 #MedTech"), "Great week at CDIE!");
  assert.equal(captionText("Thanks all.\n\n#Innovation #MedTech"), "Thanks all.");
  assert.equal(captionText("🥇 KACare\n👩🏾‍🔬 Lab day"), "KACare\nLab day");
  // A # inside a word is not a hashtag.
  assert.equal(captionText("Written in C#"), "Written in C#");
  const fan = read("components/sections/LinkedInFan.tsx");
  assert.match(fan, /captionText\(post\.text\)/);
});

test("the home gallery is the Media card fan on a phone", () => {
  const gallery = read("components/sections/RadialGallery.tsx");
  assert.match(gallery, /<GalleryFan /);
  assert.match(gallery, /md:hidden/);
  assert.match(read("components/sections/GalleryFan.tsx"), /className="fan-card"/);
});

test("the 3D printing card shows the human heart in both places", () => {
  assert.match(read("app/(site)/page.tsx"), /"three-d-printing": "\/images\/cdie-3d-printing-heart-model-01\.jpeg"/);
  const studio = read("content/studio.ts");
  const printing = studio.slice(studio.indexOf('id: "three-d-printing"'));
  const media = printing.slice(printing.indexOf("media: ["));
  assert.match(media.slice(0, 260), /^media: \[\n(?:\s*\/\/.*\n)?\s*\{ src: "\/images\/cdie-3d-printing-heart-model-01\.jpeg"/);
});

test("a capability card is never wider than its rail, and a phone shows one whole card", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.capability-card \{[^}]*flex: 0 0 min\(23\.75rem, 100%\)/);
  assert.match(css, /@media \(max-width: 767px\) \{ \.capability-rail \{ scroll-snap-type: x mandatory; \}/);
  assert.match(read("components/sections/useLoopRail.ts"), /if \(narrow\)/);
});

test("a scripted glide suspends snapping and smooth scroll, so rails do not stutter", () => {
  const motion = read("lib/motion.ts");
  assert.match(motion, /scrollSnapType = "none"/);
  assert.match(motion, /scrollBehavior = "auto"/);
  assert.match(motion, /cancelAnimationFrame/);
  // The triad dots use the same glide rather than the browser's smooth scroll.
  assert.doesNotMatch(read("components/sections/TriadRail.tsx"), /scrollIntoView\(\{ behavior: "smooth"/);
});

test("the open mobile menu closes on a tap outside it", () => {
  const nav = read("components/chrome/SiteNav.tsx");
  assert.match(nav, /addEventListener\("pointerdown", onOutside\)/);
  assert.match(nav, /bar\.current\?\.contains/);
});

test("how learning works scrolls with the page and opens on hover, tap or focus", () => {
  const accordion = read("components/sections/StageAccordion.tsx");
  assert.doesNotMatch(accordion, /stage-scroll/);
  assert.doesNotMatch(accordion, /addEventListener\("scroll"/);
  assert.match(accordion, /onClick=\{\(\) => setActive\(index\)\}/);
  assert.doesNotMatch(read("app/globals.css"), /\.stage-scroll/);
});

test("studio photographs: a smaller stage, a thumbnail strip that chooses it, and warm-up", () => {
  const stage = read("components/studio/StudioStage.tsx");
  assert.match(stage, /max-h-\[28rem\]/);
  assert.match(read("components/studio/StudioPhotoStrip.tsx"), /aria-pressed=\{on\}/);
  assert.match(read("components/studio/StudioExplorer.tsx"), /useStudioPhotoWarmup\(/);
  const warmup = read("components/studio/useStudio3DWarmup.ts");
  assert.match(warmup, /void preloadAtc3D\(\)/);
  assert.doesNotMatch(warmup, /includeAtc/);
});

test("the two sides section is gone from the design studio", () => {
  const page = read("app/(site)/design-studio/page.tsx");
  assert.doesNotMatch(page, /eyebrow="The two sides"/);
  assert.doesNotMatch(page, /WorkshopGallery/);
});

test("the newsletter note no longer promises an unsubscribe link", () => {
  assert.doesNotMatch(read("components/sections/NewsletterSignup.tsx"), /unsubscribe link/);
});
