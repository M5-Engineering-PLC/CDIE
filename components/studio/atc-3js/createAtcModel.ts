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
  floor: new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.5, metalness: 0.05 }),
  wall: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.05 }),
  baseboard: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xb88958, roughness: 0.5, metalness: 0.05 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x1e242c, roughness: 0.55, metalness: 0.25 }),
  industrialYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45, metalness: 0.1 }),
  containerBlue: new THREE.MeshStandardMaterial({ color: 0x1d4f8d, roughness: 0.5, metalness: 0.15 }),
  totalTurquoise: new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.4, metalness: 0.1 }),
  whiteEquipment: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.7 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.1 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.45 }),
  viceGold: new THREE.MeshStandardMaterial({ color: 0x9a7030, roughness: 0.5, metalness: 0.4 }),
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

  const { width: roomW, depth: roomD } = atcLayout.room;

  // 1. Concrete Floor Slab
  const floor = box('floor', [roomW, 0.2, roomD], [0, -0.1, 0], 'floor');
  root.add(floor);

  // 2. Rear Wall & Window Louvres
  const rearWall = box('rear-wall', [roomW, 1.1, 0.15], [0, 0.55, -roomD / 2], 'wall');
  root.add(rearWall);

  for (let y = 1.2; y <= 2.2; y += 0.22) {
    const slat = box(`window-slat-${y.toFixed(2)}`, [roomW - 0.4, 0.03, 0.08], [0, y, -roomD / 2], 'darkSteel');
    slat.rotation.x = 0.25;
    root.add(slat);
  }

  // Right Wall with Entrance Doorway
  const rightWall1 = box('right-wall-1', [0.15, 1.4, 3.0], [roomW / 2, 0.7, -2.8], 'wall');
  const rightWall2 = box('right-wall-2', [0.15, 1.4, 3.4], [roomW / 2, 0.7, 2.6], 'wall');
  const doorLeaf = box('entrance-door', [0.04, 2.2, 1.2], [roomW / 2 + 0.15, 1.1, 0.3], 'wall');
  doorLeaf.rotation.y = 0.3;
  root.add(rightWall1, rightWall2, doorLeaf);

  // ---------------------------------------------------------------------------
  // 3. SHIPPING CONTAINER (SHED) ARCHITECTURAL OPEN CUTAWAY
  // ---------------------------------------------------------------------------
  const contGroup = new THREE.Group();
  contGroup.name = 'shipping-container';
  contGroup.position.set(-4.4, 0, -0.2);

  const cW = 3.4;
  const cL = 6.4;
  const cH = 2.4;

  const contFloor = box('cont-floor', [cW, 0.1, cL], [0, 0.05, 0], 'darkSteel');
  contGroup.add(contFloor);

  const cornerOffsets = [
    [-cW / 2 + 0.08, -cL / 2 + 0.08],
    [cW / 2 - 0.08, -cL / 2 + 0.08],
    [-cW / 2 + 0.08, cL / 2 - 0.08],
    [cW / 2 - 0.08, cL / 2 - 0.08],
  ];
  cornerOffsets.forEach(([cx, cz], i) => {
    contGroup.add(box(`cont-corner-${i}`, [0.16, cH, 0.16], [cx, cH / 2, cz], 'containerBlue'));
  });

  contGroup.add(box('cont-back-wall', [0.12, cH, cL], [-cW / 2, cH / 2, 0], 'containerBlue'));
  contGroup.add(box('cont-side-rear', [cW, 0.65, 0.1], [0, 0.325, -cL / 2], 'containerBlue'));
  contGroup.add(box('cont-side-front', [cW, 0.65, 0.1], [0, 0.325, cL / 2], 'containerBlue'));
  contGroup.add(box('cont-air-vent', [0.06, 0.4, 0.9], [cW / 2 - 0.02, 1.6, -2.2], 'whiteEquipment'));

  let isShutterOpen = true;
  function toggleShutter(): boolean {
    isShutterOpen = !isShutterOpen;
    return isShutterOpen;
  }

  root.add(contGroup);

  // ---------------------------------------------------------------------------
  // 4. WOODWORKING: BLUE ELEPHANT ELECNC1212 ROUTER + OPERATOR WORKSTATION
  // Non-intersecting geometry with zero Z-fighting
  // ---------------------------------------------------------------------------
  const woodGroup = services['woodworking'];
  woodGroup.userData.centre = new THREE.Vector3(-4.0, 0.9, 0.9);

  const cncSub = new THREE.Group();
  cncSub.position.set(-4.0, 0.1, 0.9);

  // 4A. Tubular Steel Stand (4 legs + lower bracing)
  const cncLegOffsets = [[-0.62, -0.54], [0.62, -0.54], [-0.62, 0.54], [0.62, 0.54]] as const;
  cncLegOffsets.forEach(([lx, lz], idx) => {
    const leg = box(`cnc-leg-${idx}`, [0.08, 0.44, 0.08], [lx, 0.22, lz], 'darkSteel', 'woodworking');
    cncSub.add(leg);
  });
  const cncBraceL = box('cnc-brace-l', [1.24, 0.04, 0.04], [0, 0.12, -0.54], 'darkSteel', 'woodworking');
  const cncBraceR = box('cnc-brace-r', [1.24, 0.04, 0.04], [0, 0.12, 0.54], 'darkSteel', 'woodworking');
  cncSub.add(cncBraceL, cncBraceR);

  // 4B. Warm Industrial Yellow Chassis Bed Frame
  const cncChassis = box('cnc-chassis', [1.44, 0.16, 1.26], [0, 0.52, 0], 'industrialYellow', 'woodworking');
  cncSub.add(cncChassis);

  // 4C. Dark T-slot Vacuum Cutting Bed
  const cncBed = box('cnc-bed', [1.26, 0.04, 1.10], [0, 0.62, 0], 'darkSteel', 'woodworking');
  cncSub.add(cncBed);

  // 4D. Chrome Linear Guide Rails
  const railL = box('cnc-rail-l', [1.24, 0.02, 0.03], [0, 0.65, -0.52], 'chrome', 'woodworking');
  const railR = box('cnc-rail-r', [1.24, 0.02, 0.03], [0, 0.65, 0.52], 'chrome', 'woodworking');
  cncSub.add(railL, railR);

  // 4E. Wood Stock Workpiece
  const workpiece = box('cnc-workpiece', [0.75, 0.02, 0.65], [0, 0.65, 0], 'wood', 'woodworking');
  cncSub.add(workpiece);

  // 4F. Gantry Uprights (sitting on outer rails, no overlap)
  const gantryL = box('cnc-gantry-l', [0.18, 0.52, 0.10], [0, 0.88, -0.58], 'industrialYellow', 'woodworking');
  const gantryR = box('cnc-gantry-r', [0.18, 0.52, 0.10], [0, 0.88, 0.58], 'industrialYellow', 'woodworking');

  // 4G. Gantry Bridge Beam (spans cleanly between uprights, NO coplanar surfaces!)
  const bridgeBeam = box('cnc-bridge-beam', [0.16, 0.18, 1.04], [0, 1.04, 0], 'darkSteel', 'woodworking');
  cncSub.add(gantryL, gantryR, bridgeBeam);

  // 4H. Carriage & Spindle
  const carriage = box('cnc-carriage', [0.18, 0.24, 0.18], [0.10, 1.02, 0], 'industrialYellow', 'woodworking');
  const spindle = cylinder('cnc-spindle', 0.045, 0.24, [0.19, 0.90, 0], 'chrome', 'woodworking');
  const dustShoe = cylinder('cnc-dust-shoe', 0.08, 0.06, [0.19, 0.76, 0], 'glass', 'woodworking');
  cncSub.add(carriage, spindle, dustShoe);

  woodGroup.add(cncSub);

  // 4I. Operator CAD/CAM Desk inside container
  const desk = box('cnc-desk-top', [0.85, 0.04, 1.1], [-4.0, 0.82, -0.6], 'wood', 'woodworking');
  const deskPedestal = box('cnc-desk-pedestal', [0.75, 0.68, 0.35], [-4.0, 0.44, -0.92], 'darkSteel', 'woodworking');
  const deskLeg = box('cnc-desk-leg', [0.05, 0.68, 0.05], [-3.65, 0.44, -0.15], 'darkSteel', 'woodworking');
  const pcMonitor = box('cnc-monitor', [0.04, 0.35, 0.48], [-4.0, 1.1, -0.6], 'darkSteel', 'woodworking');
  const pcScreen = box('cnc-screen', [0.01, 0.3, 0.44], [-3.97, 1.1, -0.6], 'screen', 'woodworking');
  const keyboard = box('cnc-keyboard', [0.12, 0.02, 0.35], [-3.82, 0.85, -0.6], 'darkSteel', 'woodworking');
  const stool = cylinder('cnc-stool', 0.16, 0.04, [-3.45, 0.6, -0.6], 'wood', 'woodworking');
  const stoolLeg = cylinder('cnc-stool-leg', 0.03, 0.58, [-3.45, 0.29, -0.6], 'darkSteel', 'woodworking');

  woodGroup.add(desk, deskPedestal, deskLeg, pcMonitor, pcScreen, keyboard, stool, stoolLeg);
  root.add(woodGroup);

  // ---------------------------------------------------------------------------
  // 5. TOOLING & STORAGE (Tool Shed Shelving Racks in Container)
  // Highlighted independently or together with Metalworking
  // ---------------------------------------------------------------------------
  const toolGroup = services['tooling-storage'];
  toolGroup.userData.centre = new THREE.Vector3(-4.5, 1.2, -1.8);

  const shelfTiers = [0.15, 0.68, 1.22, 1.76];
  shelfTiers.forEach((lvl, i) => {
    const shelfMesh = box(`shelf-deck-${i}`, [0.5, 0.03, 5.0], [-5.6, 0.1 + lvl, -0.6], 'wall', 'tooling-storage');
    toolGroup.add(shelfMesh);
  });

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

  // Spray cans & hardware bins
  for (let z = -2.1; z <= -0.6; z += 0.16) {
    const can = cylinder(`can-${z.toFixed(2)}`, 0.035, 0.18, [-5.54, 0.1 + 0.78, -0.6 + z], 'screen', 'tooling-storage');
    toolGroup.add(can);
  }
  for (let z = -0.3; z <= 2.1; z += 0.35) {
    const bin = box(`bin-${z.toFixed(2)}`, [0.3, 0.16, 0.26], [-5.6, 0.1 + 0.77, -0.6 + z], 'containerBlue', 'tooling-storage');
    toolGroup.add(bin);
  }

  root.add(toolGroup);

  // ---------------------------------------------------------------------------
  // 6. LASER CUTTING: BLUE ELEPHANT CO2 LASER CUTTER ALONG REAR WALL
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
  root.add(laserGroup);

  // ---------------------------------------------------------------------------
  // 7. METALWORKING: 4 FABRICATION WORKBENCHES + RICH FUNCTIONAL TOOLS
  // ---------------------------------------------------------------------------
  const metalGroup = services['metalworking'];
  metalGroup.userData.centre = new THREE.Vector3(1.8, 0.85, 0.2);

  function createWorkbench(posX: number, posZ: number, type: 'welding' | 'assembly' | 'electronics' | 'staging') {
    const wb = new THREE.Group();
    wb.position.set(posX, 0, posZ);

    const tW = 2.9;
    const tD = 1.1;
    const tH = 0.88;

    const top = box(`bench-${type}-top`, [tW, 0.07, tD], [0, tH, 0], 'wood', 'metalworking');
    wb.add(top);

    const legCoords = [
      [-tW / 2 + 0.08, -tD / 2 + 0.08], [0, -tD / 2 + 0.08], [tW / 2 - 0.08, -tD / 2 + 0.08],
      [-tW / 2 + 0.08, tD / 2 - 0.08], [0, tD / 2 - 0.08], [tW / 2 - 0.08, tD / 2 - 0.08]
    ] as const;

    legCoords.forEach(([lx, lz], idx) => {
      const leg = box(`bench-${type}-leg-${idx}`, [0.06, tH - 0.07, 0.06], [lx, (tH - 0.07) / 2, lz], 'darkSteel', 'metalworking');
      wb.add(leg);
    });

    const stretcher = box(`bench-${type}-stretcher`, [tW - 0.16, 0.04, tD - 0.16], [0, 0.22, 0], 'darkSteel', 'metalworking');
    wb.add(stretcher);

    if (type === 'welding') {
      // TOTAL 6" Swivel Bench Vice
      const vBase = cylinder('vice-base', 0.12, 0.04, [tW / 2 - 0.22, tH + 0.055, tD / 2 - 0.14], 'viceGold', 'metalworking');
      const vBody = box('vice-body', [0.16, 0.14, 0.24], [tW / 2 - 0.22, tH + 0.145, tD / 2 - 0.14], 'viceGold', 'metalworking');
      const clampedTube = box('clamped-tube', [0.05, 0.05, 0.65], [tW / 2 - 0.22, tH + 0.175, tD / 2 - 0.02], 'darkSteel', 'metalworking');
      wb.add(vBase, vBody, clampedTube);

      // Total Inverter Arc Welder
      const welder = box('inverter-welder', [0.34, 0.25, 0.18], [-0.7, tH + 0.16, 0.12], 'industrialYellow', 'metalworking');
      wb.add(welder);

      // Angle Grinder & Spanners
      const grinder = cylinder('angle-grinder', 0.036, 0.24, [0.35, tH + 0.07, -0.15], 'totalTurquoise', 'metalworking');
      grinder.rotation.z = Math.PI / 2;
      wb.add(grinder);
    } else if (type === 'assembly') {
      // Cordless Drill, Calipers, Machinist Square, Ball-Peen Hammer
      const drill = box('cordless-drill', [0.18, 0.16, 0.06], [-0.6, tH + 0.11, 0.1], 'totalTurquoise', 'metalworking');
      const caliper = box('caliper-beam', [0.24, 0.005, 0.03], [-0.1, tH + 0.04, -0.25], 'chrome', 'metalworking');
      const square = box('machinist-square', [0.25, 0.005, 0.15], [0.45, tH + 0.04, -0.15], 'chrome', 'metalworking');
      const hammer = cylinder('hammer-handle', 0.014, 0.28, [-0.95, tH + 0.045, -0.2], 'wood', 'metalworking');
      hammer.rotation.x = Math.PI / 2;
      const tray = box('parts-tray', [0.3, 0.04, 0.2], [0.75, tH + 0.055, 0.2], 'darkSteel', 'metalworking');
      wb.add(drill, caliper, square, hammer, tray);
    } else if (type === 'electronics') {
      // Soldering Station, Solder Wire Spool, Multimeter, Breadboard
      const sUnit = box('solder-station', [0.22, 0.14, 0.18], [-0.5, tH + 0.08, 0.1], 'containerBlue', 'metalworking');
      const spool = cylinder('solder-spool', 0.04, 0.05, [-0.15, tH + 0.05, 0.2], 'darkSteel', 'metalworking');
      const dmm = box('multimeter', [0.11, 0.035, 0.19], [0.35, tH + 0.04, -0.1], 'industrialYellow', 'metalworking');
      const bb = box('breadboard', [0.24, 0.015, 0.12], [0.8, tH + 0.045, 0.1], 'whiteEquipment', 'metalworking');
      wb.add(sUnit, spool, dmm, bb);
    } else if (type === 'staging') {
      // Material Staging, Cutting Mat, Acrylic Sheet Stack, Steel Rule
      const cuttingMat = box('cutting-mat', [1.2, 0.01, 0.8], [0, tH + 0.04, 0], 'greenPost', 'metalworking');
      const acrylic = box('acrylic-stack', [0.5, 0.04, 0.4], [0.9, tH + 0.055, 0.1], 'glass', 'metalworking');
      const rule = box('steel-rule', [0.9, 0.005, 0.04], [0, tH + 0.048, -0.2], 'chrome', 'metalworking');
      wb.add(cuttingMat, acrylic, rule);
    }

    // Stools
    const st1 = cylinder(`stool-${type}-1`, 0.16, 0.04, [-0.7, 0.52, 0.35], 'wood', 'metalworking');
    const stLeg1 = cylinder(`stool-leg-${type}-1`, 0.03, 0.50, [-0.7, 0.26, 0.35], 'darkSteel', 'metalworking');
    wb.add(st1, stLeg1);

    return wb;
  }

  // 4 Workbenches forming the central fabrication islands
  metalGroup.add(createWorkbench(0.0, 1.6, 'welding'));
  metalGroup.add(createWorkbench(3.8, 1.6, 'assembly'));
  metalGroup.add(createWorkbench(3.8, -1.4, 'electronics'));
  metalGroup.add(createWorkbench(0.0, -1.4, 'staging'));

  root.add(metalGroup);

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
