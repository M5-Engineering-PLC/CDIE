/*
  Dashboard review of 30 September 2026 (dashboard.txt). Each test names the
  item it holds in place.
*/

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));

test("the bar reads Dashboard in large blue type, without Labs, Posts or Upcoming activities", () => {
  assert.match(read("components/admin/AdminBar.tsx"), /display text-title text-brand">Dashboard/);
  const layout = read("app/admin/(secure)/layout.tsx");
  assert.doesNotMatch(layout, /\/admin\/labs/);
  assert.match(layout, /dashboardCollections\.map/);
  assert.match(read("lib/admin/collections.ts"), /dashboardCollections = collections\.filter\(\(item\) => item\.id !== "posts" && item\.id !== "activities"\)/);
  assert.equal(exists("app/admin/(secure)/labs/page.tsx"), false);
});

test("the overview drops the status notes and the 30-day tiles, and opens subscribers and enquiries", () => {
  const page = read("app/admin/(secure)/page.tsx");
  assert.doesNotMatch(page, /Google Sheet connected|GitHub sync/);
  assert.doesNotMatch(page, /label="New subscribers, last 30 days"|label="Contact forms, last 30 days"/);
  assert.match(page, /<SubscriberPanel /);
  assert.match(page, /<EnquiryPanel /);
  assert.match(page, /<VisitorPanel /);
});

test("personal details are held back while the dashboard is open to anyone", () => {
  const page = read("app/admin/(secure)/page.tsx");
  assert.match(page, /showPeople=\{AUTH_ENABLED\}/);
  // and they never reach the committed snapshot
  const sync = read("scripts/sync-cms.mjs");
  assert.match(sync, /subscriptions: \[\], enquiries: \[\]/);
  assert.doesNotMatch(sync, /readTabs\(\[[^\]]*"accounts"/);
});

test("an enquiry keeps who wrote and what they said", () => {
  assert.match(read("app/api/enquiry/route.ts"), /recordEnquiry\(\{ reason: payload\.reason, name: payload\.name, email: payload\.email, message: payload\.message \}\)/);
});

test("site visitors come from the Vercel Web Analytics API, collected on public pages only", () => {
  const visitors = read("lib/admin/visitors.ts");
  assert.match(visitors, /https:\/\/api\.vercel\.com\/v1\/query\/web-analytics\/visits/);
  assert.match(visitors, /VERCEL_ANALYTICS_TOKEN/);
  assert.match(read("app/(site)/layout.tsx"), /<SiteAnalytics \/>/);
  assert.doesNotMatch(read("app/layout.tsx"), /SiteAnalytics|@vercel\/analytics/);
});

test("the site's own records can be taken off the website and put back", () => {
  assert.match(read("lib/admin/builtins.ts"), /case "newsletters":/);
  assert.match(read("app/(site)/media/page.tsx"), /!hidden\.has\(`newsletters:\$\{item\.id\}`\)/);
  assert.match(read("lib/events.ts"), /!hidden\.has\(`events:\$\{event\.id\}`\)/);
  assert.match(read("app/(site)/about/page.tsx"), /!hidden\.has\(`staff:\$\{person\.id\}`\)/);
  assert.match(read("app/(site)/programmes/mdi/page.tsx"), /!hidden\.has\(`cohorts:\$\{person\.id\}`\)/);
  // a hide names one of the site's own records, never an arbitrary key
  assert.match(read("app/admin/actions.ts"), /siteItems\(collection\.id\)\.some\(\(item\) => item\.key === key\)/);
});

test("staff lose the short bio; a cohort record is a graduand with a LinkedIn link and no programme", () => {
  const collections = read("lib/admin/collections.ts");
  assert.doesNotMatch(collections, /Short bio/);
  assert.match(collections, /label: "Graduand name"/);
  assert.match(collections, /name: "linkedin", label: "LinkedIn link", type: "url"/);
  assert.doesNotMatch(collections, /name: "programme"/);
});

test("the dashboard's Design Studio manages photographs only", () => {
  const page = read("app/admin/(secure)/studio/page.tsx");
  assert.doesNotMatch(page, /StudioExplorer/);
  assert.match(page, /<StudioPhotoAdd /);
  assert.match(read("app/admin/studio-actions.ts"), /op === "delete"/);
  assert.match(read("app/(site)/design-studio/page.tsx"), /studioPhotoOverrides\(\)/);
});

test("sign-in takes an email address, and only listed addresses can create an account", () => {
  assert.match(read("components/admin/LoginForm.tsx"), /name="email" type="email"/);
  const auth = read("lib/admin/auth.ts");
  assert.match(auth, /ADMIN_EMAILS/);
  assert.match(auth, /scrypt\$/);
  const actions = read("app/admin/actions.ts");
  assert.match(actions, /if \(!mayHaveAccount\(email\)\)/);
  assert.match(actions, /password\.length < 12/);
});
