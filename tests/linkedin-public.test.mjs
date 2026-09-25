import assert from "node:assert/strict";
import test from "node:test";

import { parsePublicPage } from "../lib/linkedin/public.ts";

const page = (graph) =>
  `<html><head><script type="application/ld+json">${JSON.stringify({ "@context": "http://schema.org", "@graph": graph })}</script></head></html>`;

test("the page's public posts become feed rows", () => {
  const rows = parsePublicPage(page([
    {
      "@type": "SocialMediaPosting",
      url: "https://www.linkedin.com/posts/example-page_tag-activity-7300000000000000001-AbCd",
      datePublished: "2026-09-24T07:30:24.606Z",
      text: " First post ",
    },
    { "@type": "Organization", name: "Example" },
  ]));
  assert.deepEqual(rows, [
    { id: "urn:li:activity:7300000000000000001", postedAt: "2026-09-24T07:30:24.606Z", text: "First post", repost: "" },
  ]);
});

test("undated posts, non-post links and broken JSON are skipped", () => {
  const rows = parsePublicPage(
    page([
      { "@type": "SocialMediaPosting", url: "https://www.linkedin.com/posts/x-activity-7300000000000000002-zz" },
      { "@type": "SocialMediaPosting", url: "https://www.linkedin.com/company/example/", datePublished: "2026-09-24T07:30:24Z" },
    ]) + `<script type="application/ld+json">{not json</script>`,
  );
  assert.deepEqual(rows, []);
});

test("a page with no structured data gives no rows", () => {
  assert.deepEqual(parsePublicPage("<html>login</html>"), []);
});
