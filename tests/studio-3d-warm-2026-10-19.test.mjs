/* Review 2026-10-19: the idle 3D warm-up is gated, stays out of the layout bundle, and the rooms share one renderer. */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { studio3DWarmPlan } from "../components/studio/studio3DWarmPlan.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const noMedia = () => ({ matches: false });

test("warm-up is gated by data saver, slow links, reduced data and device memory", () => {
  assert.equal(studio3DWarmPlan({ connection: { effectiveType: "4g" }, deviceMemory: 8 }, noMedia), "scenes");
  assert.equal(studio3DWarmPlan({}, noMedia), "scenes");
  assert.equal(studio3DWarmPlan({ connection: { saveData: true, effectiveType: "4g" }, deviceMemory: 8 }, noMedia), "none");
  for (const effectiveType of ["slow-2g", "2g", "3g"]) {
    assert.equal(studio3DWarmPlan({ connection: { effectiveType }, deviceMemory: 8 }, noMedia), "none");
  }
  assert.equal(studio3DWarmPlan({ deviceMemory: 2 }, noMedia), "code");
  assert.equal(studio3DWarmPlan({ deviceMemory: 4 }, noMedia), "scenes");
  const reducedData = (media) => ({ matches: media === "(prefers-reduced-data: reduce)" });
  assert.equal(studio3DWarmPlan({ deviceMemory: 8 }, reducedData), "none");
  const warm = read("components/studio/warmStudio3D.ts");
  assert.match(warm, /const plan = studio3DWarmPlan\(\);/);
  assert.match(warm, /if \(plan === "none"\) return;/);
  assert.match(warm, /if \(plan !== "scenes"\) return;/);
  assert.match(warm, /requestIdleCallback/);
  assert.match(warm, /timeRemaining\(\) >= budget/);
  assert.match(warm, /window\.setTimeout\(resolve\)/);
  assert.match(warm, /warming \?\?= warm\(\)/);
});

test("the layout trigger does not statically import three.js", () => {
  const layout = read("app/(site)/layout.tsx");
  assert.match(layout, /import \{ Studio3DWarmup \} from "@\/components\/studio\/Studio3DWarmup";/);
  assert.match(layout, /<Studio3DWarmup \/>/);
  assert.doesNotMatch(layout, /<ViewTransition/);
  const visited = new Set();
  const inspect = (url) => {
    if (visited.has(url.href)) return;
    visited.add(url.href);
    const source = readFileSync(url, "utf8");
    for (const [, clause, specifier] of source.matchAll(/import\s+([^;]+?)\s+from\s+["']([^"']+)["']/g)) {
      if (clause.trim().startsWith("type ")) continue;
      assert.ok(!specifier.startsWith("three"), `The layout trigger loads three.js through ${url.pathname}`);
      assert.ok(!/studioRenderer|-3js/.test(specifier), `The layout trigger loads a room statically through ${url.pathname}`);
      if (!specifier.startsWith(".")) continue;
      const base = new URL(specifier, url);
      const target = [".ts", ".tsx", "/index.ts"].map((suffix) => new URL(base.href + suffix)).find(existsSync);
      if (target) inspect(target);
    }
  };
  inspect(new URL("../components/studio/Studio3DWarmup.tsx", import.meta.url));
  assert.ok(visited.size >= 3, "the trigger, the scheduler and the preloader were inspected");
  assert.match(read("components/studio/Studio3DWarmup.tsx"), /useEffect\(/);
});

test("rooms no longer construct their own WebGLRenderer or force a context loss", () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
      const path = `${dir}/${name}`;
      if (statSync(new URL(`../${path}`, import.meta.url)).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(name)) files.push(path);
    }
  };
  walk("components/studio");
  const owners = files.filter((path) => /new (THREE\.)?WebGLRenderer\(/.test(read(path)));
  assert.deepEqual(owners, ["components/studio/studioRenderer.ts"]);
  for (const path of files) assert.doesNotMatch(read(path), /forceContextLoss/, path);
  for (const path of ["design-studio-3js/DesignStudio3D.tsx", "atc-3js/Atc3D.tsx"]) {
    assert.doesNotMatch(read(`components/studio/${path}`), /<canvas/, path);
  }
  assert.match(read("components/studio/design-studio-3js/designStudioRoom.ts"), /if \(cached\) return cached;/);
  assert.match(read("components/studio/atc-3js/atcRoom.ts"), /if \(cached\) return cached;/);
});

test("each room warms in separate slices: build, compile, then one small draw while no room is on screen", () => {
  const renderer = read("components/studio/studioRenderer.ts");
  const body = renderer.slice(renderer.indexOf("export async function warmRoom"));
  const order = ["getStudioRenderer()", "getRoom()", "compileAsync(", "owner !== null", "setSize(1, 1, false)", "drawRoom("];
  const positions = order.map((needle) => body.indexOf(needle));
  positions.forEach((position, index) => assert.ok(position > 0, `${order[index]} is in warmRoom`));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  for (let index = 1; index < positions.length; index++) {
    if (index === 4 || index === 5) continue;
    assert.match(body.slice(positions[index - 1], positions[index]), /await (idle|pause)\(\)/);
  }
  const stage = read("components/studio/StudioStage.tsx");
  assert.match(stage, /loadedStudio3D\.studio\?\.DesignStudio3D \?\? DesignStudio3D/);
});
