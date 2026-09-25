/* Tool Storage & Racks: 4-tier heavy-duty industrial shelving inside the container.
   Source: frame_7040.jpg, cnc.jpg, frame_7030.jpg.
   Runs along the interior back wall behind the router and operator desk.
   Packed with Total turquoise & yellow toolboxes, spray cans, hardware bins, and safety signs. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { addTextPlate, atcBox, atcCylinder } from "./primitives";

export function createAtcStorage(materials: AtcMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = "tool-storage-zone";
  root.userData.service = "tooling-storage";

  // Shelving system along container back wall
  // Container X center is -4.4, inner back wall is around -5.8
  const shelfX = -5.35;
  const shelfZ = -0.5;
  const totalLength = 4.8;
  const depth = 0.55;
  const height = 2.2;

  const shelving = new THREE.Group();
  shelving.name = "4-tier-industrial-tool-shelves";
  shelving.position.set(shelfX, 0, shelfZ);
  shelving.userData.service = "tooling-storage";

  // 1. Steel Upright Posts (5 sets of twin uprights with foot plates)
  const postsCount = 5;
  for (let i = 0; i < postsCount; i += 1) {
    const z = -totalLength / 2 + 0.15 + (i * (totalLength - 0.3)) / (postsCount - 1);
    for (const dx of [-depth / 2 + 0.04, depth / 2 - 0.04]) {
      shelving.add(atcBox(`shelf-post-${i}-${dx}`, [0.05, height, 0.05], [dx, height / 2, z], "steelDark", materials, "tooling-storage"));
      shelving.add(atcBox(`shelf-foot-${i}-${dx}`, [0.12, 0.02, 0.12], [dx, 0.01, z], "steel", materials, "tooling-storage"));
    }
    // Cross-tie brace between twin posts
    for (const ty of [0.4, 1.1, 1.8]) {
      shelving.add(atcBox(`shelf-brace-${i}-${ty}`, [depth - 0.08, 0.03, 0.03], [0, ty, z], "steelDark", materials, "tooling-storage"));
    }
  }

  // 2. Shelf Deck Tiers (4 tiers)
  const tierHeights = [0.25, 0.82, 1.38, 1.94] as const;
  tierHeights.forEach((y, idx) => {
    // Heavy-duty steel shelf deck
    shelving.add(atcBox(`shelf-deck-${idx}`, [depth, 0.035, totalLength], [0, y, 0], "steel", materials, "tooling-storage"));
    // Front edge retaining lip
    shelving.add(atcBox(`shelf-lip-${idx}`, [0.03, 0.06, totalLength], [depth / 2 - 0.015, y + 0.03, 0], "steelDark", materials, "tooling-storage"));
  });

  // 3. Toolboxes on Shelves (Total turquoise, industrial yellow, and black cases - Source: frame_7040.jpg)
  const caseColors = ["turquoise", "yellow", "black", "turquoise", "yellow"] as const;

  // Tier 1 (bottom shelf) - large heavy tool cases
  for (let i = 0; i < 6; i += 1) {
    const z = -totalLength / 2 + 0.45 + i * 0.72;
    const color = caseColors[i % caseColors.length];
    shelving.add(atcBox(`toolcase-t1-${i}`, [0.38, 0.28, 0.52], [0, 0.25 + 0.16, z], color, materials, "tooling-storage", 0.02));
    shelving.add(atcBox(`toolcase-handle-t1-${i}`, [0.03, 0.04, 0.14], [0.19, 0.25 + 0.16, z], "steelDark", materials, "tooling-storage", 0.01));
  }

  // Tier 2 (middle-lower shelf) - medium tool cases & power tool boxes
  for (let i = 0; i < 7; i += 1) {
    const z = -totalLength / 2 + 0.35 + i * 0.62;
    const color = caseColors[(i + 1) % caseColors.length];
    shelving.add(atcBox(`toolcase-t2-${i}`, [0.36, 0.22, 0.44], [0, 0.82 + 0.13, z], color, materials, "tooling-storage", 0.015));
  }

  // Tier 3 (middle-upper shelf) - Spray Cans (WD-40 blue/yellow & silver) and small parts bins
  for (let i = 0; i < 8; i += 1) {
    const z = -totalLength / 2 + 0.3 + i * 0.22;
    const isWd40 = i % 2 === 0;
    const can = atcCylinder(`spray-can-${i}`, 0.032, 0.19, [0.05, 1.38 + 0.11, z], isWd40 ? "containerBlue" : "chrome", materials, "tooling-storage", 16);
    shelving.add(can);
    if (isWd40) {
      shelving.add(atcCylinder(`spray-cap-${i}`, 0.022, 0.04, [0.05, 1.38 + 0.22, z], "yellow", materials, "tooling-storage", 16));
    }
  }

  // Hardware bins on Tier 3
  for (let i = 0; i < 5; i += 1) {
    const z = 0.4 + i * 0.42;
    shelving.add(atcBox(`hardware-bin-${i}`, [0.34, 0.16, 0.32], [0, 1.38 + 0.1, z], i % 2 ? "turquoise" : "steelDark", materials, "tooling-storage", 0.01));
  }

  // Tier 4 (top shelf) - spare parts boxes and bulk materials
  for (let i = 0; i < 5; i += 1) {
    const z = -totalLength / 2 + 0.5 + i * 0.85;
    shelving.add(atcBox(`top-box-${i}`, [0.42, 0.24, 0.62], [0, 1.94 + 0.14, z], "wood", materials, "tooling-storage", 0.01));
  }

  // Safety Poster on the center upright post (Source: frame_7040.jpg)
  addTextPlate(
    shelving,
    "safety-rules-poster",
    "SAFETY FIRST",
    "EYE PROTECTION REQUIRED",
    [0.32, 0.44],
    [depth / 2 + 0.015, 1.5, 0],
    "#0f766e",
    "#ffffff",
    materials,
    "tooling-storage",
  );

  root.add(shelving);

  return root;
}
