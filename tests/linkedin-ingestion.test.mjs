import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const cachedPost = JSON.parse(readFileSync(join(root, "content", "linkedin-snapshot.json"), "utf8")).posts[0];
const publishTime = Date.parse(cachedPost.postedAt) + 60_000;
const publishedId = "urn:li:share:7530000000000000000";

function runSync(t, { api = false, optional = false, rows = [] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "cdie-linkedin-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const path of ["content", "scripts", "lib", "public/linkedin"]) {
    cpSync(join(root, path), join(dir, path), { recursive: true });
  }
  const snapshotPath = join(dir, "content", "linkedin-snapshot.json");
  const before = readFileSync(snapshotPath, "utf8");
  const rowsPath = join(dir, "rows.json");
  writeFileSync(rowsPath, JSON.stringify(rows));
  const mock = join(dir, "mock.mjs");
  writeFileSync(mock, `
    import assert from "node:assert/strict";
    globalThis.fetch = async (input, options) => {
      const url = new URL(input);
      if (url.hostname === "api.linkedin.com" && url.pathname === "/rest/posts") {
        assert.equal(url.searchParams.get("author"), "urn:li:organization:1234");
        assert.equal(url.searchParams.get("q"), "author");
        assert.equal(options.headers.authorization, "Bearer test-token");
        assert.equal(options.headers["LinkedIn-Version"], "202611");
        return Response.json({ elements: [
          { id: "${publishedId}", author: "urn:li:organization:1234", publishedAt: ${publishTime}, visibility: "PUBLIC", lifecycleState: "PUBLISHED", commentary: "Notes from our student visit.", content: { media: { id: "urn:li:image:example" } } },
          { id: "urn:li:share:7530000000000000001", author: "urn:li:organization:1234", publishedAt: ${publishTime + 60_000}, visibility: "LOGGED_IN", lifecycleState: "PUBLISHED", commentary: "Private post" },
          { id: "urn:li:share:7530000000000000002", author: "urn:li:organization:1234", publishedAt: ${publishTime + 120_000}, visibility: "PUBLIC", lifecycleState: "PUBLISHED", commentary: " ", content: { media: { id: "urn:li:image:missing" } } },
        ] });
      }
      const cover = "https://media.licdn-ei.com/dms/image/example/image-shrink_1280/0";
      if (url.pathname === "/rest/images/urn%3Ali%3Aimage%3Aexample") {
        return Response.json({ downloadUrl: cover });
      }
      if (url.href === cover) {
        assert.equal(options.headers, undefined);
        const response = new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), { headers: { "content-type": "image/jpeg" } });
        Object.defineProperty(response, "url", { value: cover });
        return response;
      }
      return new Response("", { status: 403 });
    };
  `);
  const env = { ...process.env, LINKEDIN_ACCESS_TOKEN: api ? "test-token" : "", LINKEDIN_ORGANIZATION_ID: api ? "1234" : "", LINKEDIN_API_VERSION: "202611", LINKEDIN_SHEET_CSV_URL: "" };
  const args = ["--import", "./mock.mjs", "scripts/sync-linkedin.mjs", "--rows-file", rowsPath];
  if (optional) args.push("--optional");
  const result = spawnSync(process.execPath, args, { cwd: dir, env, encoding: "utf8" });
  const after = readFileSync(snapshotPath, "utf8");
  return { ...result, before, after, posts: JSON.parse(after).posts };
}

test("the scheduled sync fails on a blocked source and leaves the snapshot intact", (t) => {
  const result = runSync(t, { rows: [{ id: cachedPost.id, postedAt: cachedPost.postedAt, text: " " }] });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /HTTP 403/);
  assert.equal(result.after, result.before);
});

test("optional builds keep the snapshot when discovery is blocked", (t) => {
  const result = runSync(t, { optional: true });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.after, result.before);
});

test("the authenticated feed adds only public posts and preserves cached text against blank rows", (t) => {
  const result = runSync(t, { api: true, rows: [{ id: cachedPost.id, postedAt: cachedPost.postedAt, text: " " }] });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.posts[0].id, publishedId);
  assert.equal(result.posts[0].text, "Notes from our student visit.");
  assert.equal(result.posts[0].image, "/linkedin/post-urn-li-share-7530000000000000000.jpg");
  assert.equal(result.posts.find((post) => post.id === cachedPost.id).text, cachedPost.text);
});

test("a current sheet heartbeat keeps the fallback working during a quiet period", (t) => {
  const result = runSync(t, { rows: [{ ...cachedPost, syncedAt: new Date().toISOString() }] });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.posts[0].id, cachedPost.id);
  assert.equal(result.posts[0].text, cachedPost.text);
});
