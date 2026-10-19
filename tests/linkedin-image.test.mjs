import assert from "node:assert/strict";
import test from "node:test";

import { pickPostImage, pickPostMedia } from "../lib/linkedin/image.ts";

const og = (url) => `<html><head><meta property="og:image" content="${url}"></head></html>`;
const ld = (thumbnailUrl) =>
  `<script type="application/ld+json">${JSON.stringify({ "@graph": [{ "@type": "VideoObject", thumbnailUrl }] })}</script>`;

const feedshare = "https://media.licdn.com/dms/image/v2/D4D22/feedshare-shrink_800/B4D/0/1?e=1&v=beta&t=abc";
const cover = "https://media.licdn.com/dms/image/v2/D4D05/videocover-high/B4D/0/1?e=1&v=beta&t=abc";
const overlay = "https://dms.licdn.com/playlist/vid/v2/D4D05/thumbnail-with-play-button-overlay-high/B4D/0/1?e=1";

test("a feedshare photo is accepted and is not a video", () => {
  assert.deepEqual(pickPostMedia(og(feedshare.replace(/&/g, "&amp;"))), { url: feedshare, video: false });
  assert.equal(pickPostImage(og(feedshare)), feedshare);
});

test("a videocover thumbnail is accepted and flagged as video", () => {
  assert.deepEqual(pickPostMedia(og(overlay) + ld(cover)), { url: cover, video: true });
});

test("the dms play-button overlay alone is rejected", () => {
  assert.equal(pickPostMedia(og(overlay)), null);
});

test("a static.licdn.com logo is rejected", () => {
  assert.equal(pickPostMedia(og("https://static.licdn.com/aero-v1/sc/h/logo.png")), null);
  assert.equal(pickPostMedia(og("https://media.licdn.com/dms/image/v2/X/profile-displayphoto-shrink_200/0/1")), null);
});

test("a non-videocover thumbnail is not taken for a video", () => {
  assert.equal(pickPostMedia(ld("https://media.licdn.com/dms/image/v2/X/profile-displayphoto/0/1")), null);
});
