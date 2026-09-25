import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { deliverEnquiry, isAppsScriptUrl } from "../lib/enquiry/deliver.ts";
import { allow, isHoneypotFilled, resetThrottle } from "../lib/security/throttle.ts";
import { emailProvider, sendBatch, sendEmail } from "../lib/email.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const enquiry = { name: "A", email: "a@example.org", reason: "general", message: "Hello" };

test("the hero keeps its original mechanism: the action button on the slide", () => {
  const carousel = read("components/sections/ProgrammeHeroCarousel.tsx");
  assert.match(carousel, /hero-action/);
  assert.match(carousel, /href=\{slide\.action\.href\}/);
  assert.doesNotMatch(carousel, /ProgrammeHeroStrip/);
});

test("studio photographs show whole, each frame at its own ratio, one row on desktop", () => {
  const strip = read("components/studio/StudioPhotoStrip.tsx");
  assert.match(strip, /aspectRatio: `\$\{photo\.width\} \/ \$\{photo\.height\}`/);
  assert.match(strip, /flexGrow: photo\.width \/ photo\.height/);
  assert.match(strip, /sm:flex-nowrap/);
  assert.match(strip, /object-contain/);
  assert.doesNotMatch(strip, /object-cover/);
  const stage = read("components/studio/StudioStage.tsx");
  assert.match(stage, /imageSize/);
  assert.match(stage, /object-contain/);
  assert.match(read("components/studio/explorerModel.ts"), /media: readonly \{ src: string; alt: string; width: number; height: number \}\[\]/);
});

test("the stool back is a level semicircle on posts", () => {
  const model = read("components/studio/design-studio-3js/createDesignStudioModel.ts");
  assert.match(model, /TorusGeometry\(0\.24, 0\.03, 10, 40, Math\.PI\)/);
  assert.match(model, /back\.rotation\.x = -Math\.PI \/ 2/);
  assert.match(model, /back-post-/);
  assert.doesNotMatch(model, /open-back-cushion/);
});

test("electronics has an instrument bench on worktable 1 and focuses there", () => {
  const bench = read("components/studio/design-studio-3js/createElectronicsBench.ts");
  for (const name of ["oscilloscope", "signal-generator", "bench-power-supply"]) assert.match(bench, new RegExp(name));
  assert.match(bench, /const SERVICE = 'electronics'/);
  const model = read("components/studio/design-studio-3js/createDesignStudioModel.ts");
  assert.match(model, /services\.electronics\.add\(createElectronicsCupboards\(\), createElectronicsBench\(\)\)/);
  assert.match(model, /services\.electronics\.userData\.centre = new THREE\.Vector3\(\.\.\.electronicsBenchFocus\)/);
  assert.match(read("components/studio/design-studio-3js/tourCamera.ts"), /electronics: \{ aim: \[1\.45/);
  for (const path of ["components/studio/studioLayout.ts", "components/studio/design-studio-3js/studioLayout.ts"]) {
    assert.match(read(path), /id: 'electronics-bench'/);
  }
});

test("with no provider configured the enquiry is not sent and says so", async () => {
  const result = await deliverEnquiry(enquiry, {});
  assert.deepEqual(result, { ok: false, reason: "not_configured" });
});

test("the webhook accepts only an Apps Script address", () => {
  assert.equal(isAppsScriptUrl("https://script.google.com/macros/s/abc/exec"), true);
  assert.equal(isAppsScriptUrl("https://example.com/hook"), false);
  assert.equal(isAppsScriptUrl("http://script.google.com/x"), false);
  assert.equal(isAppsScriptUrl("not a url"), false);
});

test("a misconfigured webhook fails closed rather than posting elsewhere", async () => {
  const result = await deliverEnquiry(enquiry, { ENQUIRY_WEBHOOK_URL: "https://example.com/hook" });
  assert.deepEqual(result, { ok: false, reason: "send_failed" });
});

test("the throttle lets a window through and then stops", () => {
  resetThrottle();
  const rule = { limit: 3, windowMs: 1000 };
  assert.equal(allow("k", rule, 0), true);
  assert.equal(allow("k", rule, 1), true);
  assert.equal(allow("k", rule, 2), true);
  assert.equal(allow("k", rule, 3), false);
  assert.equal(allow("k", rule, 1001), true, "a new window opens");
  assert.equal(allow("other", rule, 3), true, "keys are independent");
});

test("a filled honeypot is a bot; an empty or missing one is not", () => {
  assert.equal(isHoneypotFilled({ company_website: "http://spam" }), true);
  assert.equal(isHoneypotFilled({ company_website: "" }), false);
  assert.equal(isHoneypotFilled({ email: "a@b.co" }), false);
  assert.equal(isHoneypotFilled(null), false);
});

test("both public forms carry the honeypot and both routes read it", () => {
  for (const file of ["components/sections/EnquiryForm.tsx", "components/sections/NewsletterSignup.tsx"]) {
    assert.match(read(file), /name="company_website"/, file);
  }
  for (const file of ["app/api/enquiry/route.ts", "app/api/subscribe/route.ts"]) {
    assert.match(read(file), /isHoneypotFilled/, file);
    assert.match(read(file), /allow\(/, file);
  }
});

test("security headers are set and the powered-by header is off", () => {
  const config = read("next.config.ts");
  assert.match(config, /poweredByHeader: false/);
  for (const header of ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security", "Content-Security-Policy"]) {
    assert.match(config, new RegExp(header));
  }
});

test("the summer programme is an opportunity with a page, a topic and a sitemap entry", () => {
  assert.match(read("content/programmes.ts"), /id: "summer-programme"/);
  assert.match(read("content/contact.ts"), /id: "summer-programme"/);
  assert.match(read("app/sitemap.ts"), /\/programmes\/summer-programme/);
  assert.match(read("app/(site)/programmes/summer-programme/page.tsx"), /summerProgrammeEditions/);
});

test("the design challenge page lists the assistive care edition after the newest", () => {
  const programmes = read("content/programmes.ts");
  const ids = [...programmes.matchAll(/id: "design-challenge-2026[^"]*"/g)].map((m) => m[0]);
  assert.deepEqual(ids, ['id: "design-challenge-2026"', 'id: "design-challenge-2026-assistive-care"']);
});

test("textiles leads with the orange-shirt photograph and every capability has media", () => {
  const studio = read("content/studio.ts");
  assert.doesNotMatch(studio, /media: \[\],/);
  assert.match(studio, /id: "textiles",[\s\S]*?media: \[\s*\{ src: "\/images\/service-textile-2\.jpg"/);
});

test("the moulding shelf is part of the model and owned by casting and moulding", () => {
  const shelf = read("components/studio/design-studio-3js/createMouldingShelf.ts");
  assert.match(shelf, /moulding-device/);
  assert.match(shelf, /yellow-enclosure-device/);
  assert.match(shelf, /'yellow', SERVICE/);
  assert.match(read("components/studio/design-studio-3js/realisticProps.ts"), /\| 'yellow'/);
  assert.match(shelf, /const SERVICE = 'casting-moulding'/);
  assert.match(read("components/studio/design-studio-3js/createDesignStudioModel.ts"), /services\['casting-moulding'\]\.add\(createMouldingShelf\(\)\)/);
});

test("CI runs the checks AGENTS.md names", () => {
  const ci = read(".github/workflows/ci.yml");
  for (const step of ["npm ci", "npm run lint", "npm run typecheck", "npm test", "npm run build"]) {
    assert.match(ci, new RegExp(step.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("the Drive folder's call posters and photographs sit on their pages", () => {
  const programmes = read("content/programmes.ts");
  assert.match(programmes, /summer-programme-call\.jpg/);
  assert.match(programmes, /design-challenge-assistive-care-call\.jpg/);
  assert.match(programmes, /training-call\.jpg/);
  for (let n = 1; n <= 7; n += 1) assert.match(programmes, new RegExp(`summer-programme-${n}\\.jpg`));
  for (let n = 1; n <= 4; n += 1) assert.match(programmes, new RegExp(`design-challenge-assistive-care-${n}\\.jpg`));
  for (let n = 1; n <= 3; n += 1) assert.match(programmes, new RegExp(`training-${n}\\.jpg`));
  assert.match(programmes, /theme: "Assistive devices"/);
  assert.match(programmes, /value: "23–27 March 2026"/);
  assert.match(programmes, /value: "11–29 May 2026"/);
  assert.match(read("app/(site)/programmes/summer-programme/page.tsx"), /call=\{edition\.call\}/);
  const training = read("app/(site)/programmes/training/page.tsx");
  assert.match(training, /<ProgrammeGallery/);
  assert.match(training, /call=\{trainingCall\}/);
  assert.match(read("docs/BUILD_PLAN.md"), /Conflict C-10, 2026-09-25/);
});

test("the newsletter sends through the same providers as the contact form", async () => {
  assert.equal(emailProvider({}), null);
  assert.equal(emailProvider({ RESEND_API_KEY: "k", ENQUIRY_FROM: "a@b.co" }), "resend");
  assert.equal(emailProvider({ ENQUIRY_WEBHOOK_URL: "https://script.google.com/macros/s/x/exec" }), "webhook");
  assert.equal(emailProvider({ ENQUIRY_WEBHOOK_URL: "https://example.com/hook" }), null, "only an Apps Script address counts");
  assert.equal(emailProvider({ WEB3FORMS_ACCESS_KEY: "k" }), null, "Web3Forms cannot reach subscribers");
  assert.equal(await sendEmail({ to: "a@b.co", subject: "s", html: "", text: "" }), false);
  assert.deepEqual(await sendBatch([{ to: "a@b.co", subject: "s", html: "", text: "" }]), { sent: 0, failed: 1 });
  assert.match(read("app/admin/actions.ts"), /EMAIL_SETUP_HINT/);
  assert.match(read("docs/SECRETS_CHECKLIST.md"), /WEBHOOK_SECRET/);
  assert.match(read(".env.example"), /ENQUIRY_WEBHOOK_SECRET=/);
});
