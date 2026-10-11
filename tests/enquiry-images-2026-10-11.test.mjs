import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildReplyUrls } from "../lib/enquiry/reply-links.mjs";

test("reply links encode each field and quote each message line", () => {
  const email = "person+tag@example.org";
  const urls = buildReplyUrls(email, "  First line & more\nSecond = line  ");
  const gmail = new URL(urls.gmail);
  const outlook = new URL(urls.outlook);
  assert.equal(gmail.searchParams.get("to"), email);
  assert.equal(gmail.searchParams.get("su"), "Re: Website enquiry");
  assert.equal(gmail.searchParams.get("body"), "> First line & more\n> Second = line");
  assert.equal(outlook.searchParams.get("to"), email);
  assert.equal(outlook.searchParams.get("subject"), "Re: Website enquiry");
  assert.equal(outlook.searchParams.get("body"), gmail.searchParams.get("body"));
  assert.ok(urls.gmail.includes(encodeURIComponent(email)));
  assert.ok(urls.outlook.includes(encodeURIComponent(email)));
});

test("long reply bodies are trimmed to URLs of about 1800 characters", () => {
  const urls = buildReplyUrls("person@example.org", "🙂 line & text\n".repeat(1200));
  assert.ok(urls.gmail.length <= 1800);
  assert.ok(urls.outlook.length <= 1800);
  const body = new URL(urls.gmail).searchParams.get("body");
  assert.ok(body.length > 0);
  assert.ok(body.split("\n").every((line) => line.startsWith("> ")));
});

test("enquiry list keys include more than the timestamp", async () => {
  const source = await readFile(new URL("../components/admin/OverviewPanels.tsx", import.meta.url), "utf8");
  assert.match(source, /key=\{`\$\{entry\.at\}-\$\{entry\.email \?\? ""\}-\$\{index\}`\}/);
});
