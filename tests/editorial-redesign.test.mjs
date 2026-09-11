import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("homepage opens with the three-programme visual carousel", () => {
  const page = read("app/page.tsx");
  assert.match(page, /ProgrammeHeroCarousel/);
  assert.match(page, /PartnerStrip/);
  assert.match(page, /VisualCardRail/);
});

test("navigation uses the logo for home and ends with the exact LOGIN label", () => {
  const site = read("content/site.ts");
  assert.doesNotMatch(site, /label: "Home"/);
  assert.match(site, /label: "LOGIN"/);
});

test("the approved programme, partner, service, story and tour assets are present", () => {
  const required = [
    "public/images/hero-workshop-1.jpg",
    "public/images/hero-workshop-2.jpg",
    "public/images/service-electronics-1.jpg",
    "public/images/partners/ku.png",
    "public/images/partners/lemelson.png",
    "public/images/partners/rice360.png",
    "public/images/partners/riceuniversity.png",
    "public/images/story-1.jpg",
    "public/images/tour-start-guided.png",
    "public/images/tour-room-explorer.png",
  ];
  for (const path of required) assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, path);
});

test("studio explorer starts with a cinematic invitation and supports a lower-left minimised model", () => {
  const explorer = read("components/studio/StudioExplorer.tsx");
  const stage = read("components/studio/StudioStage.tsx");
  assert.match(explorer, /StudioTourIntro/);
  assert.match(explorer, /scrollIntoView/);
  assert.match(stage, /Minimise 3D tour/);
  assert.match(stage, /Expand 3D tour/);
  assert.match(stage, /bottom-4 left-4/);
});

test("footer exposes icon-labelled social destinations without inventing URLs", () => {
  const footer = read("components/chrome/SiteFooter.tsx");
  assert.match(footer, /SocialIcon/);
  assert.match(footer, /socialAccounts/);
  const site = read("content/site.ts");
  assert.match(site, /href\?: string/);
});
