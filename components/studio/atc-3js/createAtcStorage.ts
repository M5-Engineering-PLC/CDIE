/* Source: the blue workshop bays and open tool shelves in the supplied ATC media. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { addTextPlate, atcBox, atcCylinder } from "./primitives";

export function createAtcStorage(materials: AtcMaterials): THREE.Group {
  const storage = new THREE.Group();
  storage.name = "blue-tool-bays-and-open-shelves";
  storage.userData.service = "tooling-storage";

  const bay = new THREE.Group();
  bay.name = "blue-corrugated-tool-bay";
  bay.position.set(-2.25, 0, -4.12);
  bay.add(atcBox("tool-bay-back", [6.5, 2.62, 0.16], [0, 1.31, 0], "blue", materials, "tooling-storage"));
  bay.add(atcBox("tool-bay-top", [6.65, 0.12, 1.18], [0, 2.68, 0.45], "blue", materials, "tooling-storage"));
  for (const x of [-3.08, -1.55, 0.15, 1.45, 2.85]) {
    bay.add(atcBox(`bay-corrugation-${x}`, [0.025, 2.52, 0.035], [x, 1.31, 0.1], "steelDark", materials, "tooling-storage"));
  }

  for (const x of [-1.55, 1.2]) {
    bay.add(atcBox(`bay-louver-frame-${x}`, [1.85, 1.76, 0.06], [x, 1.38, 0.17], "white", materials, "tooling-storage", 0.025));
    for (let y = 0.62; y <= 2.15; y += 0.19) {
      bay.add(atcBox(`bay-louver-${x}-${y.toFixed(2)}`, [1.68, 0.035, 0.1], [x, y, 0.225], "steel", materials, "tooling-storage"));
    }
  }
  const baySign = addTextPlate(
    bay,
    "tool-bay-sign",
    "WORKSHOP STORAGE",
    "",
    [1.7, 0.34],
    [0, 2.38, 0.245],
    "#e6e3d8",
    "#1b3340",
    materials,
    "tooling-storage",
  );
  if (baySign) baySign.position.y = 2.38;
  storage.add(bay);

  const shelves = new THREE.Group();
  shelves.name = "open-steel-tool-shelves";
  const shelfZ = -3.45;
  const shelfWidth = 6.6;
  for (const x of [-5.3, -3.75, -2.2, -0.65, 0.9]) {
    shelves.add(atcBox(`shelf-upright-${x}`, [0.06, 2.2, 0.07], [x, 1.14, shelfZ], "steelDark", materials, "tooling-storage"));
    shelves.add(atcBox(`shelf-foot-${x}`, [0.42, 0.055, 0.45], [x, 0.04, shelfZ + 0.12], "steel", materials, "tooling-storage"));
  }
  for (const y of [0.42, 1.02, 1.64, 2.18]) {
    shelves.add(atcBox(`shelf-deck-${y}`, [shelfWidth, 0.045, 0.7], [-2.2, y, shelfZ], "steel", materials, "tooling-storage"));
    shelves.add(atcBox(`shelf-front-lip-${y}`, [shelfWidth, 0.07, 0.035], [-2.2, y + 0.055, shelfZ + 0.35], "steelDark", materials, "tooling-storage"));
  }

  const boxColors = ["yellow", "blue", "black"] as const;
  for (let index = 0; index < 12; index += 1) {
    const column = index % 6;
    const row = Math.floor(index / 6);
    const x = -4.85 + column * 1.08;
    const y = row === 0 ? 0.59 : 1.27;
    shelves.add(atcBox(`tool-case-${index}`, [0.72, 0.3, 0.45], [x, y, shelfZ], boxColors[index % boxColors.length], materials, "tooling-storage", 0.035));
    shelves.add(atcBox(`tool-case-handle-${index}`, [0.19, 0.035, 0.035], [x, y + 0.035, shelfZ + 0.235], "steelDark", materials, "tooling-storage"));
  }

  for (let index = 0; index < 5; index += 1) {
    const x = -4.7 + index * 0.83;
    shelves.add(atcCylinder(`shelf-aerosol-can-${index}`, 0.052, 0.26, [x, 1.83, shelfZ], index % 2 ? "white" : "yellow", materials, "tooling-storage", 20));
    shelves.add(atcBox(`shelf-bin-${index}`, [0.44, 0.26, 0.46], [x + 0.4, 1.83, shelfZ], index % 2 ? "blue" : "black", materials, "tooling-storage", 0.025));
  }
  shelves.add(atcBox("small-parts-drawer-cabinet", [1.24, 0.54, 0.56], [-4.52, 0.3, shelfZ + 0.08], "blue", materials, "tooling-storage", 0.025));
  for (const y of [0.18, 0.36, 0.54]) {
    shelves.add(atcBox(`parts-drawer-front-${y}`, [1.12, 0.1, 0.025], [-4.52, y, shelfZ + 0.37], "white", materials, "tooling-storage"));
    shelves.add(atcBox(`parts-drawer-pull-${y}`, [0.17, 0.018, 0.035], [-4.52, y + 0.01, shelfZ + 0.39], "steelDark", materials, "tooling-storage"));
  }
  storage.add(shelves);
  return storage;
}
