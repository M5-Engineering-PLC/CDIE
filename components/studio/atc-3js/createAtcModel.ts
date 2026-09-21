import * as THREE from 'three';

import { atcLayout, type AtcServiceId } from './atcLayout';

type MaterialKey =
  | 'floor'
  | 'wall'
  | 'baseboard'
  | 'wood'
  | 'darkSteel'
  | 'industrialYellow'
  | 'containerBlue'
  | 'totalTurquoise'
  | 'whiteEquipment'
  | 'chrome'
  | 'screen'
  | 'glass'
  | 'viceGold'
  | 'greenPost';

export type AtcRuntime = {
  nodes: Record<string, THREE.Object3D>;
  services: Record<AtcServiceId, THREE.Group>;
  selectable: THREE.Object3D[];
  sprites: THREE.Sprite[];
  toggleShutter: () => boolean;
  setLabelsVisible: (visible: boolean) => void;
};

const palette: Record<MaterialKey, THREE.MeshStandardMaterial> = {
  floor: new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.45 }),
  wall: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.65 }),
  baseboard: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xb88958, roughness: 0.45 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x1e242c, roughness: 0.5, metalness: 0.8 }),
  industrialYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.25 }),
  containerBlue: new THREE.MeshStandardMaterial({ color: 0x1d4f8d, roughness: 0.45, metalness: 0.35 }),
  totalTurquoise: new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.35 }),
  whiteEquipment: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.1 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.45 }),
  viceGold: new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5, metalness: 0.6 }),
  greenPost: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 }),
};

function prepareMesh(mesh: THREE.Mesh, service?: AtcServiceId): THREE.Mesh {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (service) mesh.userData.service = service;
  return mesh;
}

function box(
  name: string,
  size: readonly [number, number, number],
  position: readonly [number, number, number],
  material: MaterialKey,
  service?: AtcServiceId,
): THREE.Mesh {
  const mesh = prepareMesh(
    new THREE.Mesh(new THREE.BoxGeometry(...size), palette[material].clone()),
    service,
  );
  mesh.name = name;
  mesh.position.set(...position);
  return mesh;
}

function cylinder(
  name: string,
  radius: number,
  height: number,
  position: readonly [number, number, number],
  material: MaterialKey,
  service?: AtcServiceId,
  radialSegments = 16,
): THREE.Mesh {
  const mesh = prepareMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radialSegments), palette[material].clone()),
    service,
  );
  mesh.name = name;
  mesh.position.set(...position);
  return mesh;
}

function createNumberSprite(stationId: string, number: number, service: AtcServiceId): THREE.Sprite {
  let map: THREE.CanvasTexture | null = null;
  if (typeof document !== 'undefined') {
    const cv = document.createElement('canvas');
    cv.width = 64;
    cv.height = 64;
    const ctx = cv.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 64, 64);
      ctx.fillStyle = '#0b78c0';
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(number), 32, 34);
      map = new THREE.CanvasTexture(cv);
      map.colorSpace = THREE.SRGBColorSpace;
    }
  }

  const spriteMaterial = map
    ? new THREE.SpriteMaterial({ map, color: 0xffffff, depthTest: false })
    : new THREE.SpriteMaterial({ color: 0x0b78c0, depthTest: false });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.name = `${stationId}-badge`;
  sprite.scale.set(0.65, 0.65, 1);
  sprite.renderOrder = 30;
  sprite.userData.stationId = stationId;
  sprite.userData.service = service;
  return sprite;
}

export function createAtcModel(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'atc-workshop';

  const nodes: Record<string, THREE.Object3D> = {};
  const selectable: THREE.Object3D[] = [];
  const sprites: THREE.Sprite[] = [];

  const services: Record<AtcServiceId, THREE.Group> = {
    'woodworking': new THREE.Group(),
    'tooling-storage': new THREE.Group(),
    'laser-cutting': new THREE.Group(),
    'metalworking': new THREE.Group(),
    'facility-access': new THREE.Group(),
  };

  Object.entries(services).forEach(([id, group]) => {
    group.name = `service-${id}`;
    group.userData.service = id;
    root.add(group);
  });

  const { width: roomW, depth: roomD } = atcLayout.room;

  // 1. TERRAZZO CONCRETE FLOOR SLAB
  const floor = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.2, roomD), palette.floor);
  floor.name = 'floor';
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  root.add(floor);

  // 2. GREEN CANOPY POSTS (Matching viewAsOneEntersDoor.jpg)
  const postCoords = [
    [-roomW / 2 + 0.1, -roomD / 2 + 0.1],
    [0, -roomD / 2 + 0.1],
    [roomW / 2 - 0.1, -roomD / 2 + 0.1],
    [-roomW / 2 + 0.1, roomD / 2 - 0.1],
    [0, roomD / 2 - 0.1],
    [roomW / 2 - 0.1, roomD / 2 - 0.1],
  ];
  postCoords.forEach(([px, pz], i) => {
    const post = box(`canopy-post-${i}`, [0.12, 3.2, 0.12], [px, 1.6, pz], 'greenPost');
    root.add(post);
  });

  // Open roof rafters (green trusses, no solid ceiling)
  for (let x = -roomW / 2 + 0.2; x <= roomW / 2 - 0.2; x += 3.1) {
    const rafter = box(`roof-rafter-${x.toFixed(1)}`, [0.08, 0.1, roomD], [x, 3.15, 0], 'greenPost');
    root.add(rafter);
  }

  // Back Wall with Louvre Window Slats (Behind laser cutter)
  const rearWall = box('rear-wall', [roomW, 1.1, 0.15], [0, 0.55, -roomD / 2], 'wall');
  root.add(rearWall);

  for (let y = 1.2; y <= 2.2; y += 0.22) {
    const slat = box(`window-slat-${y.toFixed(2)}`, [roomW - 0.4, 0.03, 0.08], [0, y, -roomD / 2], 'darkSteel');
    slat.rotation.x = 0.25;
    root.add(slat);
  }

  // Right Wall with Entrance Doorway
  const rightWallTop = box('right-wall-top', [0.15, 1.4, 3.0], [roomW / 2, 0.7, -2.8], 'wall');
  const rightWallBottom = box('right-wall-bottom', [0.15, 1.4, 3.4], [roomW / 2, 0.7, 2.6], 'wall');
  root.add(rightWallTop, rightWallBottom);

  const doorLeaf = box('door-leaf', [0.04, 2.2, 1.2], [roomW / 2 + 0.15, 1.1, 0.3], 'wall', 'facility-access');
  doorLeaf.rotation.y = 0.3;
  services['facility-access'].add(doorLeaf);

  // ---------------------------------------------------------------------------
  // 3. SHIPPING CONTAINER (SHED) ARCHITECTURAL OPEN CUTAWAY
  // Positioned along left wall: X: -4.4, Z: -0.2.
  // NO ROOF! Low cutaway walls so the CNC and tools inside are 100% visible!
  // ---------------------------------------------------------------------------
  const contGroup = new THREE.Group();
  contGroup.name = 'shipping-container';
  contGroup.position.set(-4.4, 0, -0.2);

  const cW = 3.4;
  const cL = 6.4;
  const cH = 2.4;

  // Container floor slab / curb
  const contFloor = box('cont-floor', [cW, 0.1, cL], [0, 0.05, 0], 'darkSteel');
  contGroup.add(contFloor);

  // Container Corner Posts
  const cornerOffsets = [
    [-cW / 2 + 0.08, -cL / 2 + 0.08],
    [cW / 2 - 0.08, -cL / 2 + 0.08],
    [-cW / 2 + 0.08, cL / 2 - 0.08],
    [cW / 2 - 0.08, cL / 2 - 0.08],
  ];
  cornerOffsets.forEach(([cx, cz], i) => {
    contGroup.add(box(`cont-corner-${i}`, [0.16, cH, 0.16], [cx, cH / 2, cz], 'containerBlue'));
  });

  // Back Wall of Container (against workshop outer wall)
  contGroup.add(box('cont-back-wall', [0.12, cH, cL], [-cW / 2, cH / 2, 0], 'containerBlue'));

  // Cutaway Low End Walls (0.7m high so cameras can see inside cleanly!)
  contGroup.add(box('cont-side-rear', [cW, 0.7, 0.1], [0, 0.35, -cL / 2], 'containerBlue'));
  contGroup.add(box('cont-side-front', [cW, 0.7, 0.1], [0, 0.35, cL / 2], 'containerBlue'));

  // White Header Beam & Shutter Housing Box (facing workshop)
  contGroup.add(box('cont-shutter-beam', [0.2, 0.25, 4.6], [cW / 2 - 0.05, cH - 0.12, 0.6], 'whiteEquipment'));

  // White Roll-Up Shutter (Open by default)
  const shutter = box('cont-shutter', [0.04, 2.0, 4.4], [cW / 2 - 0.05, cH - 0.15, 0.6], 'whiteEquipment');
  shutter.scale.set(1, 0.08, 1);
  contGroup.add(shutter);

  // Exterior Air Louvre Vent (as seen in video/photos)
  contGroup.add(box('cont-air-vent', [0.06, 0.4, 0.9], [cW / 2 - 0.02, 1.6, -2.2], 'whiteEquipment'));

  let isShutterOpen = true;
  function toggleShutter(): boolean {
    isShutterOpen = !isShutterOpen;
    shutter.scale.y = isShutterOpen ? 0.08 : 1.0;
    shutter.position.y = isShutterOpen ? cH - 0.15 : 1.1;
    return isShutterOpen;
  }

  root.add(contGroup);

  // ---------------------------------------------------------------------------
  // 4. INSIDE CONTAINER: WOODWORKING (Station 1)
  // CNC Milling Machine + Operator Workstation Desk
  // Real world coordinates: X: -4.0, Z: +0.9 (CNC), Z: -0.6 (Desk)
  // ---------------------------------------------------------------------------
  const woodGroup = services['woodworking'];
  woodGroup.userData.centre = new THREE.Vector3(-4.0, 0.9, 0.9);

  // 4A. Blue Elephant ELECNC1212 3-Axis CNC Router
  const cncBase = box('cnc-base', [1.5, 0.6, 1.4], [-4.0, 0.4, 0.9], 'industrialYellow', 'woodworking');
  const cncBed = box('cnc-bed', [1.3, 0.08, 1.2], [-4.0, 0.74, 0.9], 'darkSteel', 'woodworking');
  const cncWorkpiece = box('cnc-workpiece', [0.8, 0.04, 0.7], [-4.0, 0.8, 0.9], 'wood', 'woodworking');

  // Gantry Legs & Bridge Beam
  const legL = box('cnc-gantry-leg-l', [0.2, 0.65, 0.15], [-4.0, 1.05, 0.3], 'industrialYellow', 'woodworking');
  const legR = box('cnc-gantry-leg-r', [0.2, 0.65, 0.15], [-4.0, 1.05, 1.5], 'industrialYellow', 'woodworking');
  const gantryBeam = box('cnc-gantry-beam', [0.18, 0.22, 1.35], [-4.0, 1.3, 0.9], 'darkSteel', 'woodworking');
  const spindle = cylinder('cnc-spindle', 0.05, 0.28, [-3.82, 1.06, 0.9], 'chrome', 'woodworking');

  woodGroup.add(cncBase, cncBed, cncWorkpiece, legL, legR, gantryBeam, spindle);

  // 4B. Operator CAD/CAM Desk inside container (Left of CNC as in photo cncwithWOrkbench.jpg)
  const desk = box('cnc-desk-top', [0.85, 0.04, 1.1], [-4.0, 0.82, -0.6], 'wood', 'woodworking');
  const deskPedestal = box('cnc-desk-pedestal', [0.75, 0.68, 0.35], [-4.0, 0.44, -0.92], 'darkSteel', 'woodworking');
  const deskLeg = box('cnc-desk-leg', [0.05, 0.68, 0.05], [-3.65, 0.44, -0.15], 'darkSteel', 'woodworking');
  const pcMonitor = box('cnc-monitor', [0.04, 0.35, 0.48], [-4.0, 1.1, -0.6], 'darkSteel', 'woodworking');
  const pcScreen = box('cnc-screen', [0.01, 0.3, 0.44], [-3.97, 1.1, -0.6], 'screen', 'woodworking');
  const keyboard = box('cnc-keyboard', [0.12, 0.02, 0.35], [-3.82, 0.85, -0.6], 'darkSteel', 'woodworking');
  const stool = cylinder('cnc-stool', 0.16, 0.04, [-3.45, 0.6, -0.6], 'wood', 'woodworking');
  const stoolLeg = cylinder('cnc-stool-leg', 0.03, 0.58, [-3.45, 0.29, -0.6], 'darkSteel', 'woodworking');

  woodGroup.add(desk, deskPedestal, deskLeg, pcMonitor, pcScreen, keyboard, stool, stoolLeg);

  // ---------------------------------------------------------------------------
  // 5. INSIDE CONTAINER: TOOLING & STORAGE (Station 4)
  // Multi-tier Steel Shelves + Toolboxes + Spray cans
  // Real world coordinates: X: -5.6, Z: -0.6 (along rear inside wall)
  // ---------------------------------------------------------------------------
  const toolGroup = services['tooling-storage'];
  toolGroup.userData.centre = new THREE.Vector3(-4.5, 1.2, -1.8);

  const shelfTiers = [0.15, 0.68, 1.22, 1.76];
  shelfTiers.forEach((lvl, i) => {
    const shelfMesh = box(`shelf-deck-${i}`, [0.5, 0.03, 5.0], [-5.6, 0.1 + lvl, -0.6], 'wall', 'tooling-storage');
    toolGroup.add(shelfMesh);
  });

  // Upright Posts
  for (let z = -2.5; z <= 2.5; z += 1.25) {
    const post = box(`shelf-post-${z.toFixed(2)}`, [0.05, 2.05, 0.05], [-5.35, 1.12, -0.6 + z], 'darkSteel', 'tooling-storage');
    toolGroup.add(post);
  }

  // Toolboxes on shelves (Total turquoise and industrial yellow)
  for (let z = -2.1; z <= 2.1; z += 0.4) {
    const isTurquoise = Math.abs(z) % 0.8 < 0.3;
    const tBox = box(
      `toolbox-${z.toFixed(2)}`,
      [0.38, 0.24, 0.32],
      [-5.6, 0.1 + 0.28, -0.6 + z],
      isTurquoise ? 'totalTurquoise' : 'industrialYellow',
      'tooling-storage',
    );
    toolGroup.add(tBox);
  }

  // Spray cans & hardware bottles on middle shelf
  for (let z = -2.1; z <= -0.6; z += 0.15) {
    const can = cylinder(`can-${z.toFixed(2)}`, 0.035, 0.18, [-5.54, 0.1 + 0.78, -0.6 + z], 'screen', 'tooling-storage');
    toolGroup.add(can);
  }
  for (let z = -0.3; z <= 2.1; z += 0.35) {
    const bin = box(`bin-${z.toFixed(2)}`, [0.3, 0.16, 0.26], [-5.6, 0.1 + 0.77, -0.6 + z], 'containerBlue', 'tooling-storage');
    toolGroup.add(bin);
  }

  // ---------------------------------------------------------------------------
  // 6. MAIN OPEN WORKSHOP: LASER CUTTING (Station 3)
  // Blue Elephant CO2 Laser Cutter along Rear Wall
  // ---------------------------------------------------------------------------
  const laserGroup = services['laser-cutting'];
  laserGroup.userData.centre = new THREE.Vector3(1.2, 0.9, -3.1);

  const laserBase = box('laser-base', [1.9, 0.38, 1.35], [1.2, 0.19, -3.1], 'darkSteel', 'laser-cutting');
  const laserBody = box('laser-body', [1.88, 0.45, 1.32], [1.2, 0.6, -3.1], 'whiteEquipment', 'laser-cutting');
  const laserBed = box('laser-bed', [1.2, 0.04, 0.8], [1.08, 0.74, -3.1], 'darkSteel', 'laser-cutting');
  const laserCanopy = box('laser-canopy', [1.3, 0.03, 0.9], [1.08, 0.84, -3.1], 'glass', 'laser-cutting');
  const laserKeypad = box('laser-keypad', [0.2, 0.02, 0.24], [1.9, 0.835, -2.95], 'totalTurquoise', 'laser-cutting');
  const laserExhaust = cylinder('laser-exhaust', 0.08, 1.4, [1.2, 1.35, -3.8], 'chrome', 'laser-cutting');
  laserExhaust.rotation.x = 0.4;

  laserGroup.add(laserBase, laserBody, laserBed, laserCanopy, laserKeypad, laserExhaust);

  // ---------------------------------------------------------------------------
  // 7. MAIN OPEN WORKSHOP: METALWORKING (Station 2)
  // Twin Fabrication Workbenches + Total Swivel Vice + Welder + Grinder
  // ---------------------------------------------------------------------------
  const metalGroup = services['metalworking'];
  metalGroup.userData.centre = new THREE.Vector3(0.5, 0.9, 1.4);

  // Workbench 1 (Metalworking with Total Vice & Arc Welder)
  const bench1Top = box('bench1-top', [2.9, 0.07, 1.1], [0.2, 0.88, 1.4], 'wood', 'metalworking');
  const b1Legs = [
    [0.2 - 1.35, 0.42, 1.4 - 0.45],
    [0.2 + 1.35, 0.42, 1.4 - 0.45],
    [0.2 - 1.35, 0.42, 1.4 + 0.45],
    [0.2 + 1.35, 0.42, 1.4 + 0.45],
  ] as const;
  b1Legs.forEach(([x, y, z], idx) => {
    metalGroup.add(box(`b1-leg-${idx}`, [0.06, 0.84, 0.06], [x, y, z], 'darkSteel', 'metalworking'));
  });

  // TOTAL 6" Bench Vice (clamped on right corner)
  const vice = box('total-vice', [0.18, 0.13, 0.22], [1.4, 0.98, 1.75], 'viceGold', 'metalworking');
  const clampedTube = box('clamped-tube', [0.04, 0.04, 0.6], [1.4, 1.05, 1.85], 'darkSteel', 'metalworking');
  const welder = box('inverter-welder', [0.32, 0.24, 0.18], [-0.5, 1.03, 1.5], 'industrialYellow', 'metalworking');
  const grinder = box('angle-grinder', [0.25, 0.08, 0.08], [0.55, 0.96, 1.2], 'totalTurquoise', 'metalworking');

  metalGroup.add(bench1Top, vice, clampedTube, welder, grinder);

  // Workbench 2 (Parallel Prototyping & Assembly Bench)
  const bench2Top = box('bench2-top', [2.9, 0.07, 1.1], [3.6, 0.88, 1.4], 'wood', 'metalworking');
  const b2Legs = [
    [3.6 - 1.35, 0.42, 1.4 - 0.45],
    [3.6 + 1.35, 0.42, 1.4 - 0.45],
    [3.6 - 1.35, 0.42, 1.4 + 0.45],
    [3.6 + 1.35, 0.42, 1.4 + 0.45],
  ] as const;
  b2Legs.forEach(([x, y, z], idx) => {
    metalGroup.add(box(`b2-leg-${idx}`, [0.06, 0.84, 0.06], [x, y, z], 'darkSteel', 'metalworking'));
  });
  metalGroup.add(bench2Top);

  // ---------------------------------------------------------------------------
  // 8. 3D NUMBERED BADGES (1, 2, 3, 4)
  // ---------------------------------------------------------------------------
  atcLayout.stations.forEach((st) => {
    const sprite = createNumberSprite(st.id, st.number, st.service);
    sprite.position.set(st.position[0], st.position[1] + 1.2, st.position[2]);
    root.add(sprite);
    sprites.push(sprite);
  });

  function setLabelsVisible(visible: boolean) {
    sprites.forEach((s) => {
      s.visible = visible;
    });
  }

  // Traverse and register selectable meshes
  root.traverse((node) => {
    if (node.name) nodes[node.name] = node;
    if (node.userData.service && node instanceof THREE.Mesh && !selectable.includes(node)) {
      selectable.push(node);
    }
  });

  const runtime: AtcRuntime = {
    nodes,
    services,
    selectable,
    sprites,
    toggleShutter,
    setLabelsVisible,
  };
  root.userData.sculptRuntime = runtime;
  root.userData.approximate = true;
  root.userData.sourceAuthority = 'user-supplied-floorplan-and-atc-workshop-videos';

  return root;
}
