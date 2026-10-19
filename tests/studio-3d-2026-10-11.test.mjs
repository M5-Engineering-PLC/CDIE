/* Fix plan 2026-10-11, W2: software tests for client selection, loading, rendering, and safe geometry merging. */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import * as THREE from "three";
import { createSceneFrameLoop } from "../components/studio/sceneFrameLoop.ts";
import { mergeStaticRoomMeshes } from "../components/studio/mergeStaticRoomMeshes.ts";
import { selectStudioService, SERVICE_CHANGE } from "../components/studio/useStudioSelection.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hooks = ["design-studio-3js/useDesignStudioScene.ts", "atc-3js/useAtcScene.ts"];

test("W2: the static page leaves the URL selection to the client", () => {
  const page = read("app/(site)/design-studio/page.tsx");
  assert.doesNotMatch(page, /searchParams/);
  assert.match(page, /StudioCapabilityRail items=/);
  assert.match(read("components/studio/StudioCapabilityRail.tsx"), /onClickCapture=\{explore\}/);
  assert.match(read("components/studio/useStudioSelection.ts"), /useSyncExternalStore/);
});

test("W2: there is no idle warmup and only opened rooms mount", () => {
  assert.doesNotMatch(read("components/studio/StudioExplorer.tsx"), /useStudio3DWarmup\(/);
  assert.doesNotMatch(read("components/studio/useStudio3DWarmup.ts"), /requestIdleCallback|setTimeout|useEffect/);
  const pill = read("components/studio/StudioViewPill.tsx");
  assert.match(pill, /onMouseEnter=\{index === 0 \? prefetchStudio3D/);
  assert.match(pill, /onFocus=\{index === 0 \? prefetchStudio3D/);
  const stage = read("components/studio/StudioStage.tsx");
  assert.match(stage, /if \(open && !built\[spaceKey\]\)/);
  assert.match(stage, /built\.studio \?/);
  assert.match(stage, /built\.atc \?/);
  const visited = new Set();
  const inspect = (url) => {
    if (visited.has(url.href)) return;
    visited.add(url.href);
    const source = readFileSync(url, "utf8");
    for (const [, clause, specifier] of source.matchAll(/import\s+([^;]+?)\s+from\s+["']([^"']+)["']/g)) {
      if (clause.trim().startsWith("type ")) continue;
      assert.ok(!specifier.startsWith("three"), `Initial dependency loads three.js: ${url.pathname}`);
      if (!specifier.startsWith(".")) continue;
      const base = new URL(specifier, url);
      const target = [".ts", ".tsx", "/index.ts"].map((suffix) => new URL(base.href + suffix)).find(existsSync);
      if (target) inspect(target);
    }
  };
  inspect(new URL("../components/studio/StudioExplorer.tsx", import.meta.url));
  assert.match(read("components/studio/preloadStudio3D.ts"), /import\("\.\/design-studio-3js"\)/);
  assert.match(read("components/studio/preloadStudio3D.ts"), /import\("\.\/atc-3js"\)/);
});

test("W2: both rooms cap resolution, refresh static shadows, and share one renderer", () => {
  /* Review 2026-10-19: the renderer moved to studioRenderer.ts and is kept for the visit, so no context is forced lost. */
  const renderer = read("components/studio/studioRenderer.ts");
  assert.match(renderer, /setPixelRatio\(Math\.min\(window\.devicePixelRatio, 1\.5\)\)/);
  assert.match(renderer, /shadowMap\.autoUpdate = false/);
  assert.match(renderer, /shadowMap\.needsUpdate = true/);
  assert.doesNotMatch(renderer, /forceContextLoss/);
  for (const path of hooks) {
    const source = read(`components/studio/${path}`);
    assert.match(source, /useRoomCanvas\(/);
    assert.doesNotMatch(source, /setAnimationLoop|forceContextLoss/);
  }
  assert.match(read("components/studio/useRoomCanvas.ts"), /createSceneFrameLoop\(/);
  const loop = read("components/studio/sceneFrameLoop.ts");
  assert.match(loop, /new IntersectionObserver/);
  assert.match(loop, /!document\.hidden && !paused\(\)/);
  assert.match(loop, /addEventListener\("visibilitychange"/);
  assert.match(loop, /removeEventListener\("visibilitychange"/);
});

test("W2: client selection preserves other query fields and emits a selection event without navigation", () => {
  const previous = globalThis.window;
  const browser = new EventTarget();
  browser.location = { href: "https://example.test/design-studio?space=atc#studio-room" };
  browser.history = { replaceState: (_state, _title, url) => { browser.location.href = String(url); } };
  globalThis.window = browser;
  try {
    let changes = 0;
    browser.addEventListener(SERVICE_CHANGE, () => changes++);
    selectStudioService("woodworking");
    assert.equal(new URL(browser.location.href).searchParams.get("service"), "woodworking");
    assert.equal(new URL(browser.location.href).searchParams.get("space"), "atc");
    assert.equal(new URL(browser.location.href).hash, "#studio-room");
    assert.equal(changes, 1);
  } finally { globalThis.window = previous; }
});

test("W2: the loop sleeps at rest, settles damping, pauses unseen or hidden, and resumes invalidations", () => {
  const saved = Object.fromEntries(["window", "document", "ResizeObserver", "IntersectionObserver"].map((key) => [key, globalThis[key]]));
  const queue = new Map();
  let serial = 0, intersection, disconnected = 0, renders = 0, steps = 0, paused = false, touring = false, motion = 0;
  globalThis.window = {
    requestAnimationFrame: (callback) => { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame: (id) => queue.delete(id),
  };
  globalThis.document = Object.assign(new EventTarget(), { hidden: false });
  globalThis.ResizeObserver = class { observe() {} disconnect() { disconnected++; } };
  globalThis.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe() {} disconnect() { disconnected++; }
  };
  const camera = new THREE.PerspectiveCamera();
  const controls = Object.assign(new EventTarget(), { target: new THREE.Vector3() });
  const renderer = { shadowMap: { needsUpdate: false }, setSize() {}, render() { renders++; } };
  const shadows = { dirty: false };
  const tick = () => { const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach((callback) => callback()); };
  let loop;
  try {
    loop = createSceneFrameLoop({
      canvas: { getBoundingClientRect: () => ({ width: 800, height: 450 }) }, renderer,
      scene: {}, camera, controls, shadows, paused: () => paused, touring: () => touring,
      step: () => { steps++; if (motion > 0) { camera.position.x += 0.1; motion--; } },
    });
    assert.equal(queue.size, 0);
    intersection([{ isIntersecting: true }]);
    tick();
    assert.equal(renders, 1);
    assert.equal(queue.size, 0);
    motion = 3;
    controls.dispatchEvent(new Event("change"));
    for (let index = 0; index < 4; index++) tick();
    assert.equal(queue.size, 0);
    assert.equal(renders, 4);
    touring = true;
    loop.invalidate(); tick();
    assert.equal(queue.size, 1);
    document.hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    assert.equal(queue.size, 0);
    const stopped = steps;
    loop.invalidate(true); tick();
    assert.equal(steps, stopped);
    assert.equal(shadows.dirty, true);
    document.hidden = false;
    document.dispatchEvent(new Event("visibilitychange")); tick();
    assert.equal(queue.size, 1);
    intersection([{ isIntersecting: false }]);
    assert.equal(queue.size, 0);
    intersection([{ isIntersecting: true }]); tick();
    paused = true; loop.invalidate();
    assert.equal(queue.size, 0);
    touring = false; paused = false; loop.invalidate(); tick();
    assert.equal(queue.size, 0);
    loop.dispose();
    assert.equal(disconnected, 2);
    controls.dispatchEvent(new Event("change"));
    document.dispatchEvent(new Event("visibilitychange"));
    assert.equal(queue.size, 0);
  } finally {
    loop?.dispose();
    Object.assign(globalThis, saved);
  }
});

test("W2: merging preserves positions, capability meshes, hidden geometry, and material differences", () => {
  const root = new THREE.Group();
  const material = new THREE.MeshStandardMaterial();
  const background = new THREE.Group(); background.position.x = 4; root.add(background);
  const a = new THREE.Mesh(new THREE.BoxGeometry(), material.clone()); a.position.x = -2;
  const b = new THREE.Mesh(new THREE.BoxGeometry(), material.clone()); b.position.x = 2;
  const selected = new THREE.Mesh(new THREE.BoxGeometry(), material.clone()); selected.userData.service = "design";
  const hidden = new THREE.Mesh(new THREE.BoxGeometry(), material.clone()); hidden.visible = false;
  const other = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ roughness: 0.25 }));
  background.add(a, b, selected, hidden, other);
  const capability = new THREE.Group(); capability.userData.service = "woodworking"; root.add(capability);
  const child1 = new THREE.Mesh(new THREE.BoxGeometry(), material);
  const child2 = new THREE.Mesh(new THREE.BoxGeometry(), material); capability.add(child1, child2);
  const bounds = new THREE.Box3().setFromObject(root);
  mergeStaticRoomMeshes(root);
  assert.equal(background.children.length, 4);
  assert.equal(capability.children.length, 2);
  assert.equal(selected.parent, background);
  assert.equal(hidden.parent, background);
  assert.equal(other.parent, background);
  assert.ok(bounds.equals(new THREE.Box3().setFromObject(root)));
  const merged = background.children.find((node) => node !== selected && node !== hidden && node !== other);
  assert.equal(merged.geometry.attributes.position.count, 72);
});
