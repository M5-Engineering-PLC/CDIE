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

/*
  The bar's colour and Contact's place in it were reversed by the second pass of
  this change request: "revert navbar back to cobalt blue" and "restore contact
  page". What the first pass added and the second kept is asserted here; the
  reversed half is asserted in change-request-2026-09-21-second-pass.test.mjs.
*/
test("the bar closes on navigation and carries an icon control", () => {
  const nav = read("components/chrome/SiteNav.tsx");
  assert.match(nav, /MenuIcon/);
  assert.doesNotMatch(nav, /\{open \? "Close" : "Menu"\}/);
  assert.match(nav, /setLastPath\(pathname\)[\s\S]*setOpen\(false\)/);
  // the footer lists Contact once, through the nav, and carries LOGIN
  assert.doesNotMatch(read("app/layout.tsx"), /\.\.\.nav, \{ label: "Contact"/);
  assert.match(read("content/site.ts"), /\{ label: "Contact", href: "\/contact" \}/);
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

/*
  The photograph at the head of What CDIE is was withdrawn by the second pass:
  "remove CDIE photo, keep the initials and three images". The three pictures
  are what survived, so that is what this asserts; the lettering's return is
  asserted in change-request-2026-09-21-second-pass.test.mjs.
*/
test("What CDIE is gives each of its three words a picture", () => {
  assert.match(read("app/(site)/page.tsx"), /TriadRail/);
  assert.match(read("content/home.ts"), /image: "\/images\//);
  // a rail on a phone, a grid from md, with no JavaScript either side
  assert.match(read("components/sections/TriadRail.tsx"), /rail[\s\S]*md:grid-cols-3/);
});

test("Our latest shows one card and rotates slowly without pausing", () => {
  // Final pass 2026-09-23: a progress bar like the hero's times the card, and
  // hovering holds the bar rather than skipping a tick.
  const solo = read("components/sections/SoloCardCarousel.tsx");
  assert.match(solo, /latest-progress/);
  assert.match(solo, /onAnimationEnd/);
  assert.match(read("app/globals.css"), /\.latest-progress \{[^}]*6s linear/);
  assert.match(read("app/(site)/page.tsx"), /SoloCardCarousel/);
});

test("the Ask the team chip is gone but the real states survive", () => {
  const kicker = read("components/primitives/Kicker.tsx");
  assert.doesNotMatch(kicker, /Ask the team/);
  assert.match(kicker, /enquire: null/);
  assert.match(kicker, /Open now/);
  assert.match(kicker, /Opening soon/);
});

test("how learning works is one route, and Open X became Read more", () => {
  const page = read("app/(site)/programmes/page.tsx");
  // Final pass 2026-09-23: the landing's stages pin and play one at a time.
  assert.match(page, /StageScroll/);
  assert.match(read("components/sections/StageScroll.tsx"), /pin: true/);
  assert.match(page, /Read more/);
  assert.doesNotMatch(page, /Open \{opportunity\.title\}/);
  assert.match(read("app/(site)/programmes/invention-education/page.tsx"), /SnakeRoute/);
});

test("programme photographs follow the image matching sheet, and Catalyst has none", () => {
  // Image matching sheet 2026-09-22: each programme has its own photograph, so
  // the placeholder tag is off. P4/P9: no photograph shows a Catalyst grant.
  const programmes = read("content/programmes.ts");
  const catalyst = programmes.slice(programmes.indexOf('id: "catalyst-grants"'), programmes.indexOf('id: "training"'));
  assert.doesNotMatch(catalyst, /src: "/);
  // changes-v2, 2026-09-23: the placeholder tag is gone with the other
  // developer-facing markers, so there is no flag left to assert.
  assert.doesNotMatch(read("components/blocks/PlaceholderPhoto.tsx"), /Placeholder image/);
  assert.doesNotMatch(read("app/(site)/programmes/page.tsx"), /"catalyst-grants": \{ src/);
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
  assert.match(read("app/(site)/design-studio/page.tsx"), /atc: capability\.space === "atc"/);
});

test("component tiles name only what the source names, and claim no photograph", () => {
  const studio = read("content/studio.ts");
  assert.match(studio, /components: \[/);
  // no product, model or version may appear in a component name
  for (const [, name] of studio.matchAll(/\{ id: "[a-z0-9-]+", name: "([^"]+)"/g)) {
    assert.doesNotMatch(name, /\d/, `component name carries a number: ${name}`);
  }
  // Enhancements 2026-09-22: an unphotographed component gets no tile at all.
  const grid = read("components/studio/StudioComponentGrid.tsx");
  assert.doesNotMatch(grid, /Photograph to come/);
  assert.match(grid, /filter\(\(item\) => item\.image\)/);
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

test("Media leads with the calendar, and every event cites its source", () => {
  const media = read("app/(site)/media/page.tsx");
  const events = media.indexOf('id="events"');
  const newsletters = media.indexOf('id="newsletters"');
  const community = media.indexOf('id="community"');
  assert.ok(events > 0 && events < newsletters && newsletters < community, "calendar leads the page");
  assert.match(media, /EventCalendar/);
  // Enhancements 2026-09-22: events come from the CDIE LinkedIn feed sheet, and
  // each one links to the post it was taken from.
  const programmes = read("content/programmes.ts");
  const records = [...programmes.matchAll(/\{ id: "ev\d+".*\}/g)].map((m) => m[0]);
  assert.ok(records.length > 0, "events are populated");
  for (const record of records) assert.match(record, /link: "https:\/\/www\.linkedin\.com\/feed\/update\//, record);
  assert.match(read("docs/BUILD_PLAN.md"), /Conflict C-06/);
});

test("the community band shows three posts, labels reposts and listens", () => {
  assert.match(read("lib/linkedin/config.ts"), /RECENT_POSTS = 3/);
  assert.match(read("app/(site)/media/page.tsx"), /slice\(0, RECENT_POSTS\)/);
  assert.match(read("content/linkedin.ts"), /repost: boolean/);
  assert.match(read("components/sections/LinkedInFan.tsx"), /Repost/);
  assert.match(read("components/sections/LinkedInFan.tsx"), /Read More/);
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
