// Final pass for the build, 2026-09-23. Each test names the request it guards.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

test("studio cards: no Explore button and no instructions in the pill", () => {
  const rail = read("components/sections/VisualCardRail.tsx");
  assert.doesNotMatch(rail, /"Explore \+"|>Explore \+</);
  assert.doesNotMatch(rail, /Auto-gliding|Manual mode|Hover card to inspect/);
});

test("design studio cards show the area at rest and the location on hover", () => {
  const page = read("app/(site)/design-studio/page.tsx");
  assert.match(page, /eyebrow: capability\.name,/);
  assert.match(page, /title: spaceNames\.get\(capability\.space\)/);
});

test("the gallery wheel follows the hero directly", () => {
  const home = read("app/(site)/page.tsx");
  const hero = home.indexOf("<ProgrammeHeroCarousel");
  const gallery = home.indexOf("<RadialGallery");
  assert.ok(hero > 0 && gallery > hero, "gallery after hero");
  assert.ok(gallery < home.indexOf("<Section"), "gallery before every other band");
  assert.match(read("components/sections/RadialGallery.tsx"), /transform-origin|pin: true/);
});

test("the innovate, convene, create cards carry no numbers", () => {
  assert.doesNotMatch(read("components/sections/TriadRail.tsx"), /triad-number|padStart/);
});

test("every page asks at most five FAQs", () => {
  for (const path of ["app/(site)/programmes/page.tsx", "app/(site)/design-studio/page.tsx"]) {
    const ids = read(path).match(/const PAGE_FAQS = \[([^\]]*)\]/);
    assert.ok(ids, path);
    assert.equal(ids[1].split(",").length, 5, path);
  }
  for (const [path, name] of [["content/about.ts", "aboutFaqs"], ["content/contact.ts", "contactFaqs"], ["content/media.ts", "mediaFaqs"]]) {
    const block = read(path).split(`export const ${name}: Faq[] = [`)[1].split("\n];")[0];
    assert.ok((block.match(/question:/g) ?? []).length <= 5, path);
  }
});

test("the dashboard carries its own bar, not the site's page links", () => {
  assert.doesNotMatch(read("app/layout.tsx"), /SiteNav|SiteFooter/);
  assert.match(read("app/(site)/layout.tsx"), /SiteNav/);
  assert.match(read("app/admin/(secure)/layout.tsx"), /AdminBar/);
  assert.doesNotMatch(read("app/admin/layout.tsx"), /SiteNav/);
});

test("Media in the dashboard is now Posts", () => {
  const collections = read("lib/admin/collections.ts");
  assert.match(collections, /id: "posts",\n\s+label: "Posts"/);
  assert.doesNotMatch(collections, /label: "Media"/);
});

test("the Google Sheet is the dashboard's database and GitHub syncs from it", () => {
  const store = read("lib/admin/store.ts");
  assert.match(store, /appendRow\(collection/);
  assert.match(store, /deleteRows\(collection/);
  assert.match(store, /notifyContentChanged/);
  const workflow = read(".github/workflows/sync-cms.yml");
  assert.match(workflow, /repository_dispatch:\n\s+types: \[cms-updated\]/);
  assert.match(workflow, /node scripts\/sync-cms\.mjs/);
  // an email address does not belong in a repository
  assert.match(read("scripts/sync-cms.mjs"), /subscriptions: \[\], enquiries: \[\]/);
});
