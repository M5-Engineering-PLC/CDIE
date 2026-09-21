import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the mobile band rhythm is a token, not a padding per component", () => {
  const css = read("app/globals.css");
  assert.match(css, /--band-y: 1\.75rem/);
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*--band-y: 3\.5rem/);
  assert.match(css, /\.trim-mobile/);
  // Section and PageHero must read the token rather than declaring their own.
  for (const path of ["components/sections/Section.tsx", "components/sections/PageHero.tsx"]) {
    assert.match(read(path), /band-y/, path);
    assert.doesNotMatch(read(path), /py-14 md:py-20/, path);
  }
});

test("the bar is white, closes on navigation, and drops Contact", () => {
  const nav = read("components/chrome/SiteNav.tsx");
  assert.match(nav, /bg-surface\/95/);
  assert.doesNotMatch(nav, /bg-brand\/95/);
  assert.match(nav, /MenuIcon/);
  assert.doesNotMatch(nav, /\{open \? "Close" : "Menu"\}/);
  assert.match(nav, /setLastPath\(pathname\)[\s\S]*setOpen\(false\)/);

  const site = read("content/site.ts");
  assert.doesNotMatch(site, /label: "Contact"/);
  // the route still exists and the footer still reaches it
  assert.match(read("app/layout.tsx"), /label: "Contact", href: "\/contact"/);
});

test("no link or button label carries a trailing arrow glyph", () => {
  const files = [
    "components/primitives/Button.tsx",
    "components/primitives/Pending.tsx",
    "components/blocks/Card.tsx",
    "components/sections/ProgrammeHeroCarousel.tsx",
    "components/studio/StudioDetail.tsx",
    "components/studio/StudioTourIntro.tsx",
    "components/chrome/SiteFooter.tsx",
  ];
  for (const path of files) {
    assert.doesNotMatch(read(path), /[→↗]/u, path);
  }
  // A rail's previous/next buttons are controls, not link labels: they stay.
  // What had to go is the glyph appended to each card's action.
  assert.doesNotMatch(read("components/sections/VisualCardRail.tsx"), /\{item\.action\} →/u);
});

test("the landing carousel drops its counters and answers a swipe", () => {
  const hero = read("components/sections/ProgrammeHeroCarousel.tsx");
  assert.doesNotMatch(hero, /padStart\(2, "0"\)/);
  assert.match(hero, /onPointerDown/);
  assert.match(hero, /SWIPE_PX/);
});

test("What CDIE is carries a photograph and becomes a rail on a phone", () => {
  const home = read("app/page.tsx");
  assert.doesNotMatch(home, /display text-mega leading-none text-brand/);
  assert.match(home, /TriadRail/);
  assert.match(read("content/home.ts"), /image: "\/images\//);
  // a rail on a phone, a grid from md, with no JavaScript either side
  assert.match(read("components/sections/TriadRail.tsx"), /rail[\s\S]*md:grid-cols-3/);
});

test("Our latest shows one card and moves on after three seconds", () => {
  const solo = read("components/sections/SoloCardCarousel.tsx");
  assert.match(solo, /DWELL_MS = 3000/);
  assert.match(read("app/page.tsx"), /SoloCardCarousel/);
});

test("the Ask the team chip is gone but the real states survive", () => {
  const kicker = read("components/primitives/Kicker.tsx");
  assert.doesNotMatch(kicker, /Ask the team/);
  assert.match(kicker, /enquire: null/);
  assert.match(kicker, /Open now/);
  assert.match(kicker, /Opening soon/);
});

test("how learning works is one route, and Open X became Read more", () => {
  const page = read("app/programmes/page.tsx");
  assert.match(page, /SnakeRoute/);
  assert.match(page, /Read more/);
  assert.doesNotMatch(page, /Open \{opportunity\.title\}/);
  assert.match(read("app/programmes/invention-education/page.tsx"), /SnakeRoute/);
});

test("no programme photograph claims to be of that programme", () => {
  const programmes = read("content/programmes.ts");
  for (const [, alt] of programmes.matchAll(/alt: "([^"]+)"/g)) {
    for (const claim of ["Invention Education", "Design Challenge", "Catalyst", "cohort", "funded"]) {
      assert.doesNotMatch(alt, new RegExp(claim, "i"), `alt text claims "${claim}": ${alt}`);
    }
  }
  assert.match(read("app/programmes/page.tsx"), /PlaceholderPhoto/);
  assert.match(read("components/blocks/PlaceholderPhoto.tsx"), /Placeholder image/);
});

test("the studio hero is a background at every width, not a stacked column", () => {
  const intro = read("components/studio/StudioTourIntro.tsx");
  assert.match(intro, /fill/);
  assert.match(intro, /-z-10 object-cover/);
  assert.doesNotMatch(intro, /lg:grid-cols-/);
});

test("the tour turns the room, walks the capabilities and calls each one out", () => {
  const camera = read("components/studio/design-studio-3js/tourCamera.ts");
  assert.match(camera, /YAW_PER_FRAME/);
  assert.match(camera, /controls\.enabled = drive\.interactive/);

  const explorer = read("components/studio/StudioExplorer.tsx");
  assert.match(explorer, /STEP_MS/);
  assert.match(explorer, /useViewOnly/);
  assert.match(read("components/studio/StudioStage.tsx"), /StudioCallout/);
});

test("an ATC capability switches the stage instead of lighting another room", () => {
  assert.match(read("components/studio/StudioStage.tsx"), /if \(atc\)/);
  assert.match(read("app/design-studio/page.tsx"), /atc: capability\.space === "atc"/);
});

test("component tiles name only what the source names, and claim no photograph", () => {
  const studio = read("content/studio.ts");
  assert.match(studio, /components: \[/);
  // no product, model or version may appear in a component name
  for (const [, name] of studio.matchAll(/\{ id: "[a-z0-9-]+", name: "([^"]+)"/g)) {
    assert.doesNotMatch(name, /\d/, `component name carries a number: ${name}`);
  }
  assert.match(read("components/studio/StudioComponentGrid.tsx"), /Photograph to come/);
});

test("nothing in components/studio imports from content/", () => {
  const files = [
    "components/studio/StudioExplorer.tsx",
    "components/studio/StudioStage.tsx",
    "components/studio/StudioDetail.tsx",
    "components/studio/StudioComponentGrid.tsx",
    "components/studio/explorerModel.ts",
  ];
  for (const path of files) {
    assert.doesNotMatch(read(path), /from "@\/content\//, path);
  }
});

test("Media leads with the calendar, and the calendar invents no event", () => {
  const media = read("app/media/page.tsx");
  const events = media.indexOf('id="events"');
  const newsletters = media.indexOf('id="newsletters"');
  const community = media.indexOf('id="community"');
  assert.ok(events > 0 && events < newsletters && newsletters < community, "calendar leads the page");
  assert.match(media, /EventGantt/);
  assert.match(read("content/programmes.ts"), /export const events: CalendarEvent\[\] = \[\];/);
  assert.match(read("docs/BUILD_PLAN.md"), /Conflict C-06/);
});

test("the community band shows three posts, labels reposts and listens", () => {
  assert.match(read("lib/linkedin/config.ts"), /RECENT_POSTS = 3/);
  assert.match(read("app/media/page.tsx"), /slice\(0, RECENT_POSTS\)/);
  assert.match(read("content/linkedin.ts"), /repost: boolean/);
  assert.match(read("components/sections/LinkedInPostCard.tsx"), /Repost/);
  const carousel = read("components/sections/LinkedInCarousel.tsx");
  assert.match(carousel, /visibilitychange/);
  // a blip that empties the store must not empty a good band
  assert.match(carousel, /if \(next\.posts\.length === 0\) return;/);
  // the client half must not drag the store adapter into the browser bundle
  assert.doesNotMatch(carousel, /from "@\/lib\/linkedin"/);
});

test("no component file passes the 150-line rule", async () => {
  /*
    AGENTS.md: "No component file over 150 lines." Components are the .tsx
    files. The .ts files beside them are the studio's geometry, its layout
    module and its scene and camera code, two of which are vendored from the
    Three.js prototype and copied unchanged so the website and the prototype
    cannot drift; splitting those to satisfy a line count is the drift the
    vendoring exists to prevent.
  */
  const { readdirSync, statSync } = await import("node:fs");
  const root = new URL("../components/", import.meta.url);
  const walk = (dir) =>
    readdirSync(dir).flatMap((entry) => {
      const next = new URL(`${entry}`, dir);
      if (statSync(next).isDirectory()) return walk(new URL(`${entry}/`, dir));
      return entry.endsWith(".tsx") ? [next] : [];
    });

  for (const file of walk(root)) {
    const lines = readFileSync(file, "utf8").split("\n").length;
    assert.ok(lines <= 150, `${file.pathname} is ${lines} lines`);
  }
});
