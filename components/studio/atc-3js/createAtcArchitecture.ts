/* Architecture: Clean hyper-realistic architectural cutaway workshop envelope.
   Explicit instruction: NO GREEN BARS. Clean slate/steel framing, realistic louvres and entrance doors. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { atcBox } from "./primitives";

export function createAtcArchitecture(materials: AtcMaterials, width: number, depth: number) {
  const group = new THREE.Group();
  group.name = "atc-workshop-architecture";

  // 1. Concrete floor slab (procedural terrazzo speckle)
  group.add(atcBox("concrete-floor-slab", [width, 0.22, depth], [0, -0.11, 0], "concrete", materials));

  // 2. Rear window wall (matching site photos: low wall base + dark steel louvered window frame)
  const rearZ = -depth / 2;
  const sillHeight = 1.0;
  group.add(atcBox("rear-wall-base", [width, sillHeight, 0.16], [0, sillHeight / 2, rearZ], "wall", materials));

  // Dark steel window frame & glass
  const winHeight = 1.6;
  const winCenterY = sillHeight + winHeight / 2;
  group.add(atcBox("rear-window-glass", [width - 0.2, winHeight, 0.03], [0, winCenterY, rearZ], "glass", materials));

  // Top header beam (dark steel)
  group.add(atcBox("rear-window-header", [width, 0.12, 0.18], [0, sillHeight + winHeight + 0.06, rearZ], "steelDark", materials));

  // Vertical dark steel mullions
  const mullionCount = 8;
  for (let i = 0; i <= mullionCount; i += 1) {
    const x = -width / 2 + 0.3 + (i * (width - 0.6)) / mullionCount;
    group.add(atcBox(`rear-mullion-${i}`, [0.06, winHeight, 0.1], [x, winCenterY, rearZ], "steelDark", materials));
  }

  // Horizontal louvre slats (angled for ventilation)
  for (let y = sillHeight + 0.2; y <= sillHeight + winHeight - 0.15; y += 0.26) {
    const slat = atcBox(`rear-slat-${y.toFixed(2)}`, [width - 0.4, 0.025, 0.11], [0, y, rearZ], "steelDark", materials);
    slat.rotation.x = 0.28;
    group.add(slat);
  }

  // 3. Right Wall with Double Entrance Doorway (Source: frame_7041.jpg & unnamed.jpg)
  const rightX = width / 2;
  const doorWidth = 2.4;
  const doorZ = 0.2;

  // Rear section of right wall
  const rearRightLen = depth / 2 + (doorZ - doorWidth / 2);
  const rearRightCenterZ = -depth / 2 + rearRightLen / 2;
  group.add(atcBox("right-wall-rear", [0.16, 1.2, rearRightLen], [rightX, 0.6, rearRightCenterZ], "wall", materials));
  group.add(atcBox("right-wall-rear-glass", [0.03, 1.2, rearRightLen], [rightX, 1.8, rearRightCenterZ], "glass", materials));
  group.add(atcBox("right-wall-rear-header", [0.16, 0.1, rearRightLen], [rightX, 2.45, rearRightCenterZ], "steelDark", materials));

  // Front section of right wall
  const frontRightLen = depth / 2 - (doorZ + doorWidth / 2);
  const frontRightCenterZ = depth / 2 - frontRightLen / 2;
  group.add(atcBox("right-wall-front", [0.16, 1.2, frontRightLen], [rightX, 0.6, frontRightCenterZ], "wall", materials));
  group.add(atcBox("right-wall-front-glass", [0.03, 1.2, frontRightLen], [rightX, 1.8, frontRightCenterZ], "glass", materials));
  group.add(atcBox("right-wall-front-header", [0.16, 0.1, frontRightLen], [rightX, 2.45, frontRightCenterZ], "steelDark", materials));

  // Door header transom
  group.add(atcBox("door-transom-header", [0.18, 0.14, doorWidth], [rightX, 2.45, doorZ], "steelDark", materials, "facility-access"));

  // Entrance door leaves (Steel gate with lower solid panel and upper bars - open inward slightly)
  const leafWidth = doorWidth / 2 - 0.05;
  const leafHeight = 2.3;

  // Leaf 1 (hinged at rear jamb)
  const doorLeaf1 = new THREE.Group();
  doorLeaf1.name = "entrance-door-leaf-1";
  doorLeaf1.position.set(rightX - 0.02, 0, doorZ - doorWidth / 2 + 0.05);
  doorLeaf1.rotation.y = -0.45; // open into room
  doorLeaf1.add(atcBox("door1-lower-panel", [0.04, 1.1, leafWidth], [0, 0.55, leafWidth / 2], "steel", materials, "facility-access"));
  doorLeaf1.add(atcBox("door1-frame-top", [0.045, 0.06, leafWidth], [0, leafHeight - 0.03, leafWidth / 2], "steelDark", materials, "facility-access"));
  doorLeaf1.add(atcBox("door1-frame-stile", [0.045, leafHeight, 0.06], [0, leafHeight / 2, leafWidth - 0.03], "steelDark", materials, "facility-access"));
  for (let y = 1.25; y <= leafHeight - 0.15; y += 0.2) {
    doorLeaf1.add(atcBox(`door1-bar-${y.toFixed(2)}`, [0.025, 0.025, leafWidth - 0.06], [0, y, leafWidth / 2], "steelDark", materials, "facility-access"));
  }
  group.add(doorLeaf1);

  // Leaf 2 (hinged at front jamb)
  const doorLeaf2 = new THREE.Group();
  doorLeaf2.name = "entrance-door-leaf-2";
  doorLeaf2.position.set(rightX - 0.02, 0, doorZ + doorWidth / 2 - 0.05);
  doorLeaf2.rotation.y = 0.45; // open into room
  doorLeaf2.add(atcBox("door2-lower-panel", [0.04, 1.1, leafWidth], [0, 0.55, -leafWidth / 2], "steel", materials, "facility-access"));
  doorLeaf2.add(atcBox("door2-frame-top", [0.045, 0.06, leafWidth], [0, leafHeight - 0.03, -leafWidth / 2], "steelDark", materials, "facility-access"));
  doorLeaf2.add(atcBox("door2-frame-stile", [0.045, leafHeight, 0.06], [0, leafHeight / 2, -leafWidth + 0.03], "steelDark", materials, "facility-access"));
  for (let y = 1.25; y <= leafHeight - 0.15; y += 0.2) {
    doorLeaf2.add(atcBox(`door2-bar-${y.toFixed(2)}`, [0.025, 0.025, leafWidth - 0.06], [0, y, -leafWidth / 2], "steelDark", materials, "facility-access"));
  }
  group.add(doorLeaf2);

  // 4. Perimeter baseboard runner (dark steel)
  group.add(atcBox("baseboard-rear", [width, 0.06, 0.03], [0, 0.03, rearZ + 0.08], "steelDark", materials));
  group.add(atcBox("baseboard-right-1", [0.03, 0.06, rearRightLen], [rightX - 0.08, 0.03, rearRightCenterZ], "steelDark", materials));
  group.add(atcBox("baseboard-right-2", [0.03, 0.06, frontRightLen], [rightX - 0.08, 0.03, frontRightCenterZ], "steelDark", materials));

  return group;
}
