/* Retains the blue shipping-container cutaway from the previous ATC model. */

import * as THREE from "three";

import { atcLayout } from "./atcLayout";
import type { AtcMaterials } from "./materials";
import { atcBox } from "./primitives";

export function createAtcContainer(materials: AtcMaterials): THREE.Group {
  const container = new THREE.Group();
  container.name = "shipping-container";
  container.position.set(...atcLayout.container.position);

  const [width, height, length] = atcLayout.container.size;
  const halfWidth = width / 2;
  const halfLength = length / 2;

  container.add(atcBox("cont-floor", [width, 0.1, length], [0, 0.05, 0], "steelDark", materials));

  for (const x of [-halfWidth + 0.18, halfWidth - 0.18]) {
    container.add(atcBox(`container-base-runner-${x}`, [0.14, 0.15, length - 0.3], [x, -0.025, 0], "steelDark", materials));
    container.add(atcBox(`container-top-long-rail-${x}`, [0.13, 0.13, length], [x, height - 0.07, 0], "blue", materials));
  }

  for (const z of [-halfLength + 0.1, halfLength - 0.1]) {
    for (const x of [-halfWidth + 0.09, halfWidth - 0.09]) {
      container.add(atcBox(
        `container-corner-post-${x}-${z}`,
        [0.17, height, 0.17],
        [x, height / 2, z],
        "blue",
        materials,
        undefined,
        0.018,
      ));
    }
    container.add(atcBox(`container-low-end-panel-${z}`, [width - 0.2, 0.64, 0.1], [0, 0.36, z], "blue", materials));
    container.add(atcBox(`container-end-top-rail-${z}`, [width, 0.12, 0.13], [0, height - 0.07, z], "blue", materials));

    for (let x = -halfWidth + 0.29; x < halfWidth - 0.16; x += 0.25) {
      container.add(atcBox(
        `container-end-corrugation-${z}-${x.toFixed(2)}`,
        [0.035, 0.55, 0.035],
        [x, 0.36, z + (z < 0 ? -0.055 : 0.055)],
        "steelDark",
        materials,
      ));
    }
  }

  // The earlier cutaway exposed the interior through the positive-X side.
  const backWallX = -halfWidth + 0.06;
  container.add(atcBox("cont-back-wall", [0.12, height - 0.2, length - 0.25], [backWallX, height / 2, 0], "blue", materials));
  for (let z = -halfLength + 0.28; z <= halfLength - 0.2; z += 0.24) {
    container.add(atcBox(
      `container-back-wall-corrugation-${z.toFixed(2)}`,
      [0.045, height - 0.24, 0.045],
      [backWallX - 0.075, height / 2, z],
      "steelDark",
      materials,
    ));
  }

  container.add(atcBox("container-open-side-header", [0.13, 0.14, length - 0.14], [halfWidth - 0.08, height - 0.07, 0], "blue", materials));
  container.add(atcBox("container-vent-frame", [0.045, 0.48, 0.94], [backWallX - 0.1, 1.67, -2.1], "white", materials));
  for (let y = 1.5; y <= 1.85; y += 0.09) {
    container.add(atcBox(`container-vent-louver-${y.toFixed(2)}`, [0.035, 0.025, 0.8], [backWallX - 0.13, y, -2.1], "steelDark", materials));
  }

  return container;
}
