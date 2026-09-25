import assert from "node:assert/strict";
import test from "node:test";

import { linkedInUrn, rowsFromLinks } from "../lib/linkedin/links.ts";

test("every link form LinkedIn hands out gives the post's URN", () => {
  const id = "urn:li:activity:7508065548178710528";
  assert.equal(linkedInUrn("https://www.linkedin.com/feed/update/urn:li:activity:7508065548178710528/"), id);
  assert.equal(linkedInUrn("https://www.linkedin.com/feed/update/urn%3Ali%3Aactivity%3A7508065548178710528"), id);
  assert.equal(linkedInUrn("https://www.linkedin.com/embed/feed/update/urn:li:activity:7508065548178710528"), id);
  assert.equal(
    linkedInUrn("https://www.linkedin.com/posts/cdie-ku_ive-design-challenge-activity-7508065548178710528-AbCd?utm_source=share"),
    id,
  );
  assert.equal(linkedInUrn("https://www.linkedin.com/feed/update/urn:li:ugcPost:7300000000000000001/"), "urn:li:ugcPost:7300000000000000001");
  assert.equal(linkedInUrn("https://www.linkedin.com/posts/someone_x-share-7300000000000000002-zz"), "urn:li:share:7300000000000000002");
});

test("anything that is not a LinkedIn post is refused", () => {
  assert.equal(linkedInUrn(undefined), null);
  assert.equal(linkedInUrn("not a url"), null);
  assert.equal(linkedInUrn("http://www.linkedin.com/feed/update/urn:li:activity:1/"), null);
  assert.equal(linkedInUrn("https://evil.example/feed/update/urn:li:activity:1/"), null);
  assert.equal(linkedInUrn("https://www.linkedin.com/company/cdie-ku/"), null);
});

test("dashboard posts with a LinkedIn link become feed rows; the rest are skipped", () => {
  const rows = rowsFromLinks([
    { title: "Winners", date: "2026-09-22", link: "https://www.linkedin.com/feed/update/urn:li:activity:7508065548178710528/" },
    { title: "Open day", createdAt: "2026-09-20T08:00:00.000Z", link: "https://cdie.co.ke/open-day" },
    { title: "No link", createdAt: "2026-09-20T08:00:00.000Z" },
  ]);
  assert.deepEqual(rows, [
    { id: "urn:li:activity:7508065548178710528", postedAt: "2026-09-22T00:00:00Z", text: "Winners", title: "Winners", repost: "" },
  ]);
});
