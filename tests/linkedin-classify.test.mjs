/* Fix plan 2026-10-11, W3: software tests use the actual snapshot post texts. */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

import { calendarItem, classifyCalendar, classifyPost } from "../lib/linkedin/classify.mjs";
import { dateFromText, validDate } from "../lib/linkedin/dates.mjs";
import { latestOverrides, placePosts, postKey, uniqueCalendar } from "../lib/linkedin/placement.mjs";

const snapshot = JSON.parse(await readFile(new URL("../content/linkedin-snapshot.json", import.meta.url), "utf8"));
const fixture = (id) => {
  const post = snapshot.posts.find((item) => item.id.endsWith(id));
  assert.ok(post, `Required snapshot fixture ${id} exists`);
  return post;
};
const football = fixture("7513897246992539648");
const workshop = fixture("7513863648130498560");
const catalyst = fixture("7512804259827163137");
const metalworking = fixture("7514226263406989312");
const synthetic = (text, postedAt = "2026-10-08T09:45:05.142Z") => ({ ...football, text, postedAt });
const override = (post, placement, date = "", at = "2026-10-11T12:00:00Z") => ({ url: post.permalink, placement, date, at });

test("the Friday football fixture is an event on the explicit 9 October date", () => {
  assert.deepEqual(classifyPost(football), { kind: "event", date: "2026-10-09" });
  assert.equal(calendarItem(football).link, football.permalink);
});

test('the "Own What You Build" IP workshop uses its explicit year and ordinal date', () => {
  assert.deepEqual(classifyPost(workshop), { kind: "event", date: "2026-10-22" });
  assert.equal(calendarItem(workshop).image, workshop.image);
});

test("Catalyst still open and rolling review is an Announcement on the post date", () => {
  assert.deepEqual(classifyPost(catalyst), { kind: "announcement", date: null });
  assert.equal(calendarItem(catalyst).start, "2026-10-05");
  assert.equal(calendarItem(catalyst).kind, "Announcement");
});

test("the metalworking class fixture remains community", () => {
  assert.deepEqual(classifyPost(metalworking), { kind: "community", date: null });
  assert.deepEqual(classifyCalendar([metalworking]), []);
});

test("weekday resolution uses the post date, including same day and month/year rollover", () => {
  assert.equal(dateFromText("Join us this Friday", football.postedAt), "2026-10-09");
  assert.equal(dateFromText("Friday", "2026-10-09T07:00:00Z"), "2026-10-09");
  assert.equal(dateFromText("next Friday", "2026-10-09T07:00:00Z"), "2026-10-16");
  assert.equal(dateFromText("this Friday", "2026-12-31T07:00:00Z"), "2027-01-01");
  assert.equal(dateFromText("this Monday", "2026-10-31T07:00:00Z"), "2026-11-02");
});

test("explicit dates accept either month order and take precedence over a weekday", () => {
  assert.equal(dateFromText("Join us this Friday. Date: October 12", football.postedAt), "2026-10-12");
  assert.equal(dateFromText("9 Oct", football.postedAt), "2026-10-09");
  assert.equal(dateFromText("Friday 9 Oct 2027", football.postedAt), "2027-10-09");
  assert.equal(dateFromText("2026-10-12", football.postedAt), "2026-10-12");
  assert.equal(dateFromText("February 29, 2028", football.postedAt), "2028-02-29");
});

test("invalid dates never roll into a different date", () => {
  assert.equal(dateFromText("Friday, February 30, 2026", football.postedAt), null);
  assert.equal(dateFromText("October 32", football.postedAt), null);
  assert.equal(dateFromText("this Friday", "invalid"), null);
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(validDate("2026-13-01"), false);
});

test("events need a date/time and an invitation or place, or a LinkedIn events link", () => {
  for (const text of ["Join us 9 Oct", "Register for October 12", "RSVP 4PM", "Workshop 5:30 PM", "Session at 16:30", "9 Oct Venue: CDIE", "9 Oct, Kahawa Sukari Football Turf"]) {
    assert.equal(classifyPost(synthetic(text)).kind, "event", text);
  }
  for (const text of ["9 Oct: new metal", "Workshop highlights", "We spent 4 hours in the studio"]) {
    assert.equal(classifyPost(synthetic(text)).kind, "community", text);
  }
  assert.equal(classifyPost(synthetic("https://www.linkedin.com/events/123/")).kind, "event");
  assert.equal(classifyPost(synthetic("https://www.linkedin.com.evil.example/events/123/")).kind, "community");
});

test("all planned announcement keywords work without inventing a deadline", () => {
  for (const text of ["Applications open", "Call for proposals", "Now open", "Still open", "Deadline", "Rolling review", "Apply now", "Apply here"]) {
    const post = synthetic(text);
    assert.equal(classifyPost(post).kind, "announcement", text);
    assert.equal(calendarItem(post).start, post.postedAt.slice(0, 10));
    assert.equal(calendarItem(post).kind, "Announcement");
  }
  /* A recap that only mentions grants is not a call to apply. */
  assert.equal(classifyPost(synthetic("We introduced the Design Challenges, Summer Program, and Catalyst Grants that are open to students")).kind, "community");
  assert.equal(calendarItem(synthetic("Workshop at 4PM")).kind, "Announcement");
  assert.equal(calendarItem(synthetic("https://www.linkedin.com/events/123/")).kind, "Announcement");
  assert.equal(calendarItem({ ...football, postedAt: "invalid" }), null);
});

test("the offline snapshot calendar matches classification and preserves local images", () => {
  assert.deepEqual(snapshot.calendar, classifyCalendar(snapshot.posts));
  assert.ok(snapshot.calendar.some((item) => item.link === football.permalink));
  assert.ok(snapshot.calendar.some((item) => item.link === workshop.permalink));
  assert.ok(snapshot.calendar.some((item) => item.link === catalyst.permalink));
  assert.ok(!snapshot.calendar.some((item) => item.link === metalworking.permalink));
  assert.ok(snapshot.eventImages);
  assert.equal(calendarItem({ ...workshop, image: "https://media.licdn.com/image.jpg" }).image, undefined);
});

test("the newest valid override wins independent of sheet row order; later ties win", () => {
  const older = override(football, "community", "", "2026-10-10T12:00:00Z");
  const newer = override(football, "hidden");
  assert.deepEqual(latestOverrides([newer, older]), [newer]);
  assert.deepEqual(latestOverrides([older, newer]), [newer]);
  const tie = override(football, "calendar", "2026-10-12");
  assert.deepEqual(latestOverrides([newer, tie]), [tie]);
  assert.deepEqual(latestOverrides([
    { ...newer, placement: "invalid" }, { ...newer, date: "2026-02-30" },
    { ...newer, url: "https://evil.example/" }, { ...newer, at: "invalid" },
  ]), []);
});

test("equivalent LinkedIn URL forms share an override and a deduplication key", () => {
  const slug = "https://www.linkedin.com/posts/cdie-ku_match-activity-7513897246992539648-test?source=share";
  assert.equal(postKey(slug), postKey(football.permalink));
  const rows = latestOverrides([override(football, "calendar"), { ...override(football, "hidden"), url: slug }]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].placement, "hidden");
});

test("Calendar, Community, Hide and date correction change the public placement", () => {
  const posts = [football, workshop, catalyst, metalworking];
  const result = placePosts(posts, classifyCalendar(posts), [
    override(football, "community"), override(workshop, "calendar", "2026-10-23"),
    override(catalyst, "hidden"), override(metalworking, "calendar", "2026-10-08"),
  ]);
  assert.deepEqual(result.community.map((post) => post.id), [football.id]);
  assert.deepEqual(result.calendar.map((item) => [item.link, item.start, item.kind]), [
    [workshop.permalink, "2026-10-23", "Event"], [metalworking.permalink, "2026-10-08", "Announcement"],
  ]);
  assert.ok(result.excluded.has(postKey(catalyst.permalink)));
  assert.ok(result.corrected.has(postKey(workshop.permalink)));
  assert.equal(new Set([...result.community.map((post) => postKey(post.permalink)), ...result.calendar.map((item) => postKey(item.link))]).size, 3);
});

test("no overrides use automatic placement and dates", () => {
  const posts = [football, workshop, catalyst, metalworking];
  const result = placePosts(posts, classifyCalendar(posts), []);
  assert.deepEqual(result.calendar, classifyCalendar(posts));
  assert.deepEqual(result.community, [metalworking]);
  assert.equal(result.excluded.size, 0);
});

test("calendar deduplication keeps dashboard links and removes overridden duplicates", () => {
  const dashboard = { ...calendarItem(football), id: "dashboard-event" };
  const other = { id: "other", link: "https://cdie.co.ke/" };
  assert.deepEqual(uniqueCalendar([dashboard, calendarItem(football), other]), [dashboard, other]);
  assert.equal(uniqueCalendar([dashboard])[0].link, football.permalink);
  assert.deepEqual(uniqueCalendar([dashboard, calendarItem(football), other], new Set([postKey(football.permalink)])), [other]);
});

/* Exercise the production functions with storage and framework boundaries
   replaced by software fixtures. These tests do not contact a live sheet. */
async function loadFunctionModule(path, dependencies) {
  const { transpileModule, ModuleKind } = createRequire(import.meta.url)("typescript");
  const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } });
  const runtimeModule = { exports: {} };
  runInNewContext(outputText, { module: runtimeModule, exports: runtimeModule.exports, console, Date, Set, Map,
    require: (name) => {
      assert.ok(name in dependencies, `Dependency ${name} is explicit in the fixture`);
      return dependencies[name];
    },
  });
  return runtimeModule.exports;
}

test("D1: the production calendar function passes dashboard event and activity links through", async () => {
  const placements = placePosts(snapshot.posts, snapshot.calendar, []);
  const records = {
    events: [{ id: "dashboard-event", title: "Event fixture", start: "2026-10-09", link: football.permalink }],
    activities: [{ id: "dashboard-activity", title: "Activity fixture", start: "2026-10-22", link: workshop.permalink }],
    posts: [],
  };
  const { getCalendarEvents } = await loadFunctionModule("lib/events.ts", {
    "@/content/linkedin-snapshot.json": { default: snapshot },
    "@/content/programmes": { events: [] },
    "@/lib/admin/store": { listItems: async (collection) => records[collection], hiddenKeys: async () => new Set() },
    "@/lib/eventWindow": { openingIndex: () => 0 },
    "@/lib/linkedin": { getLinkedInPlacements: async () => placements },
    "@/lib/linkedin/placement.mjs": { postKey, uniqueCalendar },
  });
  const events = await getCalendarEvents();
  assert.equal(events.find((event) => event.id === "dashboard-event").link, football.permalink);
  assert.equal(events.find((event) => event.id === "dashboard-activity").link, workshop.permalink);
  assert.equal(events.filter((event) => event.link === football.permalink).length, 1);
  assert.equal(events.filter((event) => event.link === workshop.permalink).length, 1);
});

test("the save action requires the admin guard, validates inputs, and invalidates CMS_TAG after a write", async () => {
  const calls = [];
  let denied = false;
  let writeFails = false;
  const { saveLinkedInPost } = await loadFunctionModule("app/admin/linkedin-actions.ts", {
    "next/cache": { updateTag: (tag) => calls.push(["tag", tag]), revalidatePath: (path) => calls.push(["path", path]) },
    "@/content/linkedin-snapshot.json": { default: snapshot },
    "@/lib/admin/auth": { requireAdmin: async () => { calls.push(["guard"]); if (denied) throw new Error("Login required"); } },
    "@/lib/admin/linkedinOverrides": { saveLinkedinOverride: async (row) => { if (writeFails) throw new Error("Sheet unavailable"); calls.push(["write", row]); } },
    "@/lib/admin/store": { CMS_TAG: "cms" },
    "@/lib/linkedin/dates.mjs": { validDate },
  });
  const form = (patch = {}) => {
    const data = new FormData();
    for (const [key, value] of Object.entries({ url: football.permalink, placement: "calendar", date: "2026-10-12", ...patch })) data.set(key, value);
    return data;
  };
  denied = true;
  await assert.rejects(saveLinkedInPost({}, form()), /Login required/);
  assert.equal(calls.length, 1);
  denied = false;
  for (const patch of [{ url: "https://evil.example/" }, { placement: "invalid" }, { date: "2026-02-30" }]) {
    calls.length = 0;
    assert.ok((await saveLinkedInPost({}, form(patch))).error);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], "guard");
  }
  calls.length = 0;
  const result = await saveLinkedInPost({}, form());
  assert.equal(result.saved, true);
  assert.equal(calls[0][0], "guard");
  assert.equal(calls[1][0], "write");
  assert.equal(calls[1][1].url, football.permalink);
  assert.equal(calls[1][1].date, "2026-10-12");
  assert.ok(calls[1][1].at);
  assert.equal(calls[2][0], "tag");
  assert.equal(calls[2][1], "cms");
  assert.ok(calls.some(([kind, path]) => kind === "path" && path === "/media"));
  assert.ok(calls.some(([kind, path]) => kind === "path" && path === "/programmes"));
  calls.length = 0;
  writeFails = true;
  assert.ok((await saveLinkedInPost({}, form())).error);
  assert.equal(calls.some(([kind]) => kind === "tag"), false);
});

test("override helpers use the CMS cache tag, ignore an unconfigured sheet, and append the required columns", async () => {
  let configured = false;
  const calls = [];
  const current = override(football, "calendar", "2026-10-12");
  const older = override(football, "hidden", "", "2026-10-10T12:00:00Z");
  const helpers = await loadFunctionModule("lib/admin/linkedinOverrides.ts", {
    "next/cache": { unstable_cache: (read, keys, configuration) => {
      calls.push(["cache", keys, configuration]);
      return read;
    } },
    "@/lib/linkedin/placement.mjs": { latestOverrides },
    "./store": { CMS_TAG: "cms" },
    "./sheets": {
      sheetsConfigured: () => configured,
      readTab: async (tab) => { calls.push(["read", tab]); return [current, older]; },
      appendRow: async (tab, row) => calls.push(["append", tab, row]),
    },
  });
  assert.equal(calls[0][2].tags[0], "cms");
  assert.equal(calls[0][2].revalidate, 300);
  calls.length = 0;
  assert.equal((await helpers.linkedinOverrides()).length, 0);
  assert.equal(calls.length, 0);
  await assert.rejects(helpers.saveLinkedinOverride(current), /not configured/);
  configured = true;
  assert.deepEqual(await helpers.linkedinOverrides(), [current]);
  assert.equal(calls[0][1], "linkedin");
  await helpers.saveLinkedinOverride(current);
  assert.equal(calls[1][0], "append");
  assert.equal(calls[1][1], "linkedin");
  assert.equal(Object.keys(calls[1][2]).sort().join(","), "at,date,placement,url");
  assert.equal(calls[1][2].date, current.date);
  await assert.rejects(helpers.saveLinkedinOverride({ ...current, date: "2026-02-30" }), /invalid/);
  assert.equal(calls.length, 2);
});
