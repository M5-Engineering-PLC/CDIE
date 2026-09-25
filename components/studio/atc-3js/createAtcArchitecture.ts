/* Source: user-supplied ATC floor plan and IMG_0936.MP4 through IMG_0940.MP4. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { atcBox } from "./primitives";

function addWindowWall(
  group: THREE.Group,
  length: number,
  axis: "x" | "z",
  offset: number,
  materials: AtcMaterials,
) {
  const alongX = axis === "x";
  const sillSize: [number, number, number] = alongX ? [length, 1.04, 0.16] : [0.16, 1.04, length];
  const sillPosition: [number, number, number] = alongX ? [0, 0.52, offset] : [offset, 0.52, 0];
  group.add(atcBox(`window-sill-${axis}-${offset}`, sillSize, sillPosition, "wall", materials));

  const glassSize: [number, number, number] = alongX ? [length - 0.14, 1.9, 0.035] : [0.035, 1.9, length - 0.14];
  const glassPosition: [number, number, number] = alongX ? [0, 2.02, offset] : [offset, 2.02, 0];
  group.add(atcBox(`window-glass-${axis}-${offset}`, glassSize, glassPosition, "glass", materials));

  const mullionCount = Math.floor(length / 1.12);
  for (let index = 0; index <= mullionCount; index += 1) {
    const along = -length / 2 + (length * index) / mullionCount;
    const size: [number, number, number] = alongX ? [0.045, 1.98, 0.11] : [0.11, 1.98, 0.045];
    const position: [number, number, number] = alongX ? [along, 2.02, offset] : [offset, 2.02, along];
    group.add(atcBox(`window-mullion-${axis}-${offset}-${index}`, size, position, "steelDark", materials));
  }

  for (const y of [1.28, 1.73, 2.18, 2.63, 2.98]) {
    const size: [number, number, number] = alongX ? [length - 0.05, 0.035, 0.12] : [0.12, 0.035, length - 0.05];
    const position: [number, number, number] = alongX ? [0, y, offset] : [offset, y, 0];
    group.add(atcBox(`window-rail-${axis}-${offset}-${y}`, size, position, "steelDark", materials));
  }
}

export function createAtcArchitecture(materials: AtcMaterials, width: number, depth: number) {
  const group = new THREE.Group();
  group.name = "atc-open-workshop-shell";

  group.add(atcBox("concrete-floor-slab", [width, 0.22, depth], [0, -0.11, 0], "concrete", materials));

  addWindowWall(group, width, "x", -depth / 2, materials);
  addWindowWall(group, depth, "z", -width / 2, materials);
  addWindowWall(group, depth, "z", width / 2, materials);

  const supportXs = [-width / 2 + 0.16, 0, width / 2 - 0.16];
  const supportZs = [-depth / 2 + 0.18, depth / 2 - 0.18];
  for (const x of supportXs) {
    for (const z of supportZs) {
      group.add(atcBox(`green-frame-column-${x}-${z}`, [0.2, 3.75, 0.2], [x, 1.875, z], "green", materials, undefined, 0.012));
      group.add(atcBox(`green-column-foot-${x}-${z}`, [0.42, 0.08, 0.42], [x, 0.04, z], "green", materials, undefined, 0.018));
      group.add(atcBox(`green-column-cap-${x}-${z}`, [0.3, 0.1, 0.3], [x, 3.73, z], "green", materials, undefined, 0.014));
    }
  }

  const roofFrame = new THREE.Group();
  roofFrame.name = "visible-green-roof-frame";
  for (const z of [-depth / 2 + 0.22, -depth / 6, depth / 6, depth / 2 - 0.22]) {
    roofFrame.add(atcBox(`roof-girder-${z}`, [width, 0.16, 0.16], [0, 3.78, z], "green", materials, undefined, 0.018));
  }
  for (let x = -width / 2 + 0.4; x <= width / 2; x += 1.6) {
    roofFrame.add(atcBox(`roof-purlin-${x.toFixed(1)}`, [0.09, 0.12, depth], [x, 3.92, 0], "green", materials, undefined, 0.01));
  }
  group.add(roofFrame);

  const roof = new THREE.Group();
  roof.name = "corrugated-metal-roof-cutaway";
  roof.visible = false;
  roof.add(atcBox("roof-metal-sheet", [width, 0.055, depth], [0, 4.08, 0], "steel", materials));
  const ribs = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.025, 0.045, depth),
    materials.palette.chrome.clone(),
    Math.floor(width / 0.18),
  );
  ribs.name = "corrugated-roof-ribs";
  ribs.castShadow = true;
  ribs.receiveShadow = true;
  const matrix = new THREE.Matrix4();
  const count = Math.floor(width / 0.18);
  for (let index = 0; index < count; index += 1) {
    const x = -width / 2 + 0.09 + index * 0.18;
    matrix.makeTranslation(x, 4.13, 0);
    ribs.setMatrixAt(index, matrix);
  }
  ribs.instanceMatrix.needsUpdate = true;
  roof.add(ribs);

  return {
    group,
    roof,
    toggleRoof: () => {
      roof.visible = !roof.visible;
      return roof.visible;
    },
  };
}
