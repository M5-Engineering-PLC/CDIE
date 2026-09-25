/* Source: the two M.W. and two W.W. zones on the supplied ATC floor plan. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { atcBox, atcCylinder } from "./primitives";

function createBench(
  name: string,
  position: readonly [number, number, number],
  materials: AtcMaterials,
  service: "metalworking" | "woodworking",
) {
  const bench = new THREE.Group();
  bench.name = name;
  bench.position.set(...position);
  bench.userData.service = service;
  const width = 2.55;
  const depth = 1.12;
  const height = 0.88;
  bench.add(atcBox(`${name}-wood-top`, [width, 0.09, depth], [0, height, 0], "wood", materials, service, 0.025));
  bench.add(atcBox(`${name}-steel-worktop-insert`, [0.94, 0.018, 0.72], [0.56, height + 0.052, 0.04], "steel", materials, service));

  for (const x of [-width / 2 + 0.11, width / 2 - 0.11]) {
    for (const z of [-depth / 2 + 0.12, depth / 2 - 0.12]) {
      bench.add(atcBox(`${name}-leg-${x}-${z}`, [0.075, height - 0.09, 0.075], [x, (height - 0.09) / 2, z], "steelDark", materials, service, 0.01));
      bench.add(atcBox(`${name}-foot-${x}-${z}`, [0.22, 0.045, 0.16], [x, 0.022, z], "steel", materials, service));
    }
  }
  bench.add(atcBox(`${name}-front-rail`, [width - 0.16, 0.07, 0.055], [0, 0.31, depth / 2 - 0.1], "steelDark", materials, service));
  bench.add(atcBox(`${name}-back-rail`, [width - 0.16, 0.07, 0.055], [0, 0.31, -depth / 2 + 0.1], "steelDark", materials, service));
  bench.add(atcBox(`${name}-lower-shelf`, [width - 0.3, 0.055, depth - 0.27], [0, 0.18, 0], "steel", materials, service));
  return bench;
}

function addVice(group: THREE.Group, materials: AtcMaterials, name: string, x: number, z: number) {
  group.add(atcBox(`${name}-base`, [0.25, 0.055, 0.25], [x, 0.99, z], "steelDark", materials, "metalworking", 0.018));
  group.add(atcBox(`${name}-body`, [0.19, 0.16, 0.25], [x, 1.09, z], "blue", materials, "metalworking", 0.018));
  group.add(atcBox(`${name}-jaw-fixed`, [0.09, 0.12, 0.28], [x, 1.19, z - 0.16], "chrome", materials, "metalworking"));
  group.add(atcBox(`${name}-jaw-moving`, [0.09, 0.12, 0.28], [x, 1.19, z + 0.16], "chrome", materials, "metalworking"));
  const handle = atcCylinder(`${name}-handle`, 0.018, 0.42, [x, 1.0, z + 0.26], "chrome", materials, "metalworking", 16);
  handle.rotation.z = Math.PI / 2;
  group.add(handle);
}

export function createAtcMetalWorkstations(materials: AtcMaterials): THREE.Group {
  const stations = new THREE.Group();
  stations.name = "two-metalworking-benches";
  const positions = [
    [-3.55, 0, -1.65],
    [-3.55, 0, 1.25],
  ] as const;

  positions.forEach(([x, y, z], index) => {
    const bench = createBench(`metalworking-bench-${index + 1}`, [x, y, z], materials, "metalworking");
    addVice(bench, materials, `bench-${index + 1}-vise`, -0.86, -0.18);
    const steelStock = atcCylinder(`bench-${index + 1}-steel-stock`, 0.035, 0.6, [0.2, 0.99, 0.15], "chrome", materials, "metalworking", 16);
    steelStock.rotation.z = Math.PI / 2;
    bench.add(steelStock);
    bench.add(atcBox(`bench-${index + 1}-tool-case`, [0.43, 0.12, 0.28], [0.82, 1.0, -0.24], index ? "blue" : "black", materials, "metalworking", 0.02));
    bench.add(atcBox(`bench-${index + 1}-measuring-rule`, [0.6, 0.012, 0.035], [0.05, 0.94, 0.31], "chrome", materials, "metalworking"));
    stations.add(bench);
  });

  return stations;
}

export function createAtcWoodAssemblyStation(materials: AtcMaterials): THREE.Group {
  const station = createBench("woodworking-assembly-table", [3.5, 0, 3.05], materials, "woodworking");
  station.add(atcBox("assembly-plywood-sheet", [1.3, 0.035, 0.72], [-0.35, 0.947, -0.04], "plywood", materials, "woodworking", 0.008));
  station.add(atcBox("assembly-panel-offcut-a", [0.54, 0.045, 0.3], [0.76, 0.985, -0.17], "wood", materials, "woodworking", 0.008));
  station.add(atcBox("assembly-panel-offcut-b", [0.38, 0.045, 0.22], [0.65, 1.035, -0.17], "plywood", materials, "woodworking", 0.008));
  station.add(atcBox("assembly-jig-rail-a", [1.1, 0.025, 0.045], [-0.28, 0.98, 0.38], "steel", materials, "woodworking"));
  station.add(atcBox("assembly-jig-rail-b", [0.045, 0.025, 0.58], [0.26, 0.98, 0.12], "steel", materials, "woodworking"));
  for (const x of [-0.52, 0.52]) {
    station.add(atcBox(`assembly-clamp-${x}`, [0.045, 0.18, 0.06], [x, 1.1, 0.43], "steelDark", materials, "woodworking"));
  }
  return station;
}
