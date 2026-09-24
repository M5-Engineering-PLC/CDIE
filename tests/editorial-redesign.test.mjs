import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("homepage opens with the three-programme visual carousel", () => {
  const page = read("app/(site)/page.tsx");
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
  ];
  for (const path of required) assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, path);
});

test("studio explorer starts with a cinematic invitation and one 3D/photographs pill", () => {
  const explorer = read("components/studio/StudioExplorer.tsx");
  const stage = read("components/studio/StudioStage.tsx");
  assert.match(explorer, /StudioTourIntro/);
  assert.match(explorer, /scrollIntoView/);
  // Enhancements 2026-09-22: the pill is the one view switch at every width,
  // and the expand button is gone.
  assert.match(stage, /StudioViewPill/);
  assert.doesNotMatch(stage, /Expand 3D tour/);
  assert.doesNotMatch(read("components/studio/StudioViewPill.tsx"), /md:hidden/);
});

test("footer exposes icon-labelled social destinations without inventing URLs", () => {
  const footer = read("components/chrome/SiteFooter.tsx");
  assert.match(footer, /SocialIcon/);
  assert.match(footer, /socialAccounts/);
  const site = read("content/site.ts");
  assert.match(site, /href\?: string/);
});

test("every programme's enquiry button names a topic the contact form knows", () => {
  const programmes = read("content/programmes.ts");
  const contact = read("content/contact.ts");
  const known = new Set(
    [...contact.matchAll(/\{ id: "([a-z-]+)", label:/g)].map((match) => match[1]),
  );
  assert.ok(known.size >= 5, "enquiry topics should parse");

  for (const [, topic] of programmes.matchAll(/topic: "([a-z-]+)"/g)) {
    assert.equal(known.has(topic), true, `opportunity topic ${topic} is not an enquiry topic`);
  }
  for (const [, topic] of programmes.matchAll(/href: "\/contact\?topic=([a-z-]+)"/g)) {
    assert.equal(known.has(topic), true, `link topic ${topic} is not an enquiry topic`);
  }
});

test("the studio's two sides are Graduate School and ATC, and textiles sits with the first", () => {
  const studio = read("content/studio.ts");
  assert.match(studio, /name: "Graduate School"/);
  assert.doesNotMatch(studio, /name: "Design Studio"/);
  const textiles = studio.slice(studio.indexOf('id: "textiles"'));
  assert.match(textiles.slice(0, 200), /space: "studio"/);
  // the ATC summary must not still claim textiles
  const atc = studio.slice(studio.indexOf('id: "atc"'), studio.indexOf('id: "design"'));
  assert.doesNotMatch(atc, /textiles/i);
});

// 2026-09-24: casting and moulding maps onto the 3D printing rack's lowest
// shelf, and the "No mapped area" notice is withdrawn.
test("casting and moulding lights the lowest printer shelf, with no unmapped notice", () => {
  const detail = read("components/studio/StudioDetail.tsx");
  assert.doesNotMatch(detail, /Nothing documents where|No mapped area/);
  assert.doesNotMatch(detail, /held at the ATC/);
  assert.match(read("content/studio.ts"), /modelGroup: "casting-moulding"/);
  assert.match(read("components/studio/design-studio-3js/createDesignStudioModel.ts"), /alsoService = 'casting-moulding'/);
});
