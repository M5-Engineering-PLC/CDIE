/*
  Review of 30 September 2026, phone capability cards: "remove white background
  for text, keep text only, change arrow to diagonal, remove arrow once tapped".
*/

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

test("a closed phone card shows a diagonal arrow cue", () => {
  const card = read("components/sections/VisualCardRail.tsx");
  assert.match(card, /<span className="capability-cue"><svg[^>]*><path d="M7 17 17 7M8 7h9v9" \/>/);
  assert.doesNotMatch(card, /M5 12h14M13 6l6 6-6 6/);
});

test("an open phone card is its words on the photograph: no white panel, no arrow", () => {
  const css = read("app/globals.css");
  assert.doesNotMatch(css, /\.capability-card\.is-open \{[^}]*background: var\(--color-surface\)/);
  assert.doesNotMatch(css, /\.capability-card\.is-open \.capability-detail \{[^}]*background: var\(--color-surface\)/);
  assert.match(css, /\.capability-card\.is-open \.capability-cue \{ display: none; \}/);
  // the link spreads over the words, so the words are what is tapped
  assert.match(css, /\.capability-card\.is-open \.capability-action \{ position: absolute; inset: 0;[^}]*background: transparent/);
});
