import * as THREE from 'three';

import { atcLayout, type AtcServiceId } from './atcLayout';

type MaterialKey =
  | 'floor'
  | 'wall'
  | 'baseboard'
  | 'wood'
  | 'darkSteel'
  | 'containerBlue'
  | 'industrialYellow'
  | 'chrome'
  | 'screen'
  | 'glass'
  | 'whiteEquipment'
  | 'totalTurquoise'
  | 'red'
  | 'viceGold';

export type AtcRuntime = {
  nodes: Record<string, THREE.Object3D>;
  services: Record<AtcServiceId, THREE.Group>;
  selectable: THREE.Object3D[];
  sprites: THREE.Sprite[];
  toggleShutter: () => boolean;
  setLabelsVisible: (visible: boolean) => void;
};

const palette: Record<MaterialKey, THREE.MeshStandardMaterial> = {
  floor: new THREE.MeshStandardMaterial({ color: 0xeae7e1, roughness: 0.42 }),
  wall: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.65, metalness: 0.15 }),
  baseboard: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xc7925e, roughness: 0.48 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x1e242c, roughness: 0.5, metalness: 0.75 }),
  containerBlue: new THREE.MeshStandardMaterial({ color: 0x1d4f8d, roughness: 0.45, metalness: 0.35 }),
  industrialYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.25 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.15, metalness: 0.95 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.45 }),
  whiteEquipment: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.1 }),
  totalTurquoise: new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.3 }),
  red: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 }),
  viceGold: new THREE.MeshStandardMaterial({ color: 0xb58c38, roughness: 0.45, metalness: 0.65 }),
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
  let map: THREE.CanvasTexture | undefined;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 128, 128);
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(number), 64, 67);
      map = new THREE.CanvasTexture(canvas);
      map.colorSpace = THREE.SRGBColorSpace;
    }
  }

  const spriteMaterial = map
    ? new THREE.SpriteMaterial({ map, color: 0xffffff, depthTest: false })
    : new THREE.SpriteMaterial({ color: 0x2563eb, depthTest: false });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.name = `${stationId}-number-sprite`;
  sprite.scale.set(0.45, 0.45, 0.45);
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

  // 1. FLOOR & PERIMETER ARCHITECTURE
  const floor = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.2, roomD), palette.floor);
  floor.name = 'floor';
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  root.add(floor);

  // Rear Wall with Louvred Window Slats
  const rearWall = box('rear-wall', [roomW, 1.2, 0.16], [0, 0.6, -roomD / 2], 'wall');
  root.add(rearWall);
  const rearBaseboard = box('rear-baseboard', [roomW, 0.1, 0.18], [0, 0.05, -roomD / 2], 'baseboard');
  root.add(rearBaseboard);

  for (let y = 1.3; y <= 2.2; y += 0.2) {
    const slat = box(`window-slat-${y}`, [roomW - 0.5, 0.035, 0.08], [0, y, -roomD / 2], 'darkSteel');
    slat.rotation.x = 0.25;
    root.add(slat);
  }

  // Left Cutaway Wall
  const leftWall = box('left-wall', [0.16, 1.6, roomD], [-roomW / 2, 0.8, 0], 'wall');
  root.add(leftWall);

  // Front Curb (low cutaway)
  const frontCurb = box('front-curb', [roomW, 0.4, 0.16], [0, 0.2, roomD / 2], 'wall');
  root.add(frontCurb);

  // Right Wall with Entrance
  const rightWallTop = box('right-wall-top', [0.16, 1.6, 2.8], [roomW / 2, 0.8, -3.0], 'wall');
  root.add(rightWallTop);
  const rightWallBottom = box('right-wall-bottom', [0.16, 1.6, 3.6], [roomW / 2, 0.8, 2.6], 'wall');
  root.add(rightWallBottom);

  // Entrance Double Door
  const door1 = box('door-leaf-left', [0.05, 2.2, 1.1], [roomW / 2 + 0.25, 1.1, -0.1], 'wall', 'facility-access');
  door1.rotation.y = -0.3;
  services['facility-access'].add(door1);
  const door2 = box('door-leaf-right', [0.05, 2.2, 1.1], [roomW / 2 + 0.25, 1.1, 1.1], 'wall', 'facility-access');
  door2.rotation.y = 0.3;
  services['facility-access'].add(door2);

  // 2. BLUE SHIPPING CONTAINER
  const contGroup = new THREE.Group();
  contGroup.name = 'shipping-container';
  contGroup.position.set(-4.5, 0, -0.2);

  const contW = 3.2;
  const contL = 6.4;
  const contH = 2.5;

  const contCurb = box('cont-curb', [contW + 0.4, 0.12, contL + 0.2], [-0.1, 0.06, 0], 'wall');
  contGroup.add(contCurb);

  const contFloor = box('cont-floor', [contW - 0.2, 0.04, contL - 0.2], [-0.1, 0.14, 0], 'darkSteel');
  contGroup.add(contFloor);

  contGroup.add(box('cont-back', [0.1, contH, contL], [-contW / 2, contH / 2, 0], 'containerBlue'));
  contGroup.add(box('cont-left', [contW, contH, 0.1], [0, contH / 2, -contL / 2], 'containerBlue'));
  contGroup.add(box('cont-right', [contW, contH, 0.1], [0, contH / 2, contL / 2], 'containerBlue'));
  contGroup.add(box('cont-roof', [contW, 0.1, contL], [0, contH + 0.05, 0], 'containerBlue'));
  contGroup.add(box('cont-front-left', [0.1, contH, 1.4], [contW / 2 - 0.05, contH / 2, -contL / 2 + 0.7], 'containerBlue'));
  contGroup.add(box('cont-shutter-box', [0.35, 0.3, 4.8], [contW / 2 - 0.05, contH - 0.18, 0.8], 'whiteEquipment'));

  // Roll-Up Shutter
  const shutter = box('cont-shutter', [0.05, 2.2, 4.6], [contW / 2 - 0.05, contH - 0.22, 0.8], 'chrome');
  shutter.scale.set(1, 0.08, 1);
  contGroup.add(shutter);

  let isShutterOpen = true;
  function toggleShutter(): boolean {
    isShutterOpen = !isShutterOpen;
    shutter.scale.y = isShutterOpen ? 0.08 : 1.0;
    shutter.position.y = isShutterOpen ? contH - 0.22 : 1.2;
    return isShutterOpen;
  }

  // 3. INSIDE CONTAINER: DENSE SHELVING & POWER TOOL STORAGE
  const shelfLevels = [0.15, 0.7, 1.25, 1.8];
  shelfLevels.forEach((lvl, i) => {
    const shelfMesh = box(`shelf-deck-${i}`, [0.5, 0.03, 5.2], [-1.1, 0.14 + lvl, -0.4], 'wall', 'tooling-storage');
    services['tooling-storage'].add(shelfMesh);
  });

  // Toolboxes on shelves (Total turquoise and industrial yellow)
  for (let z = -2.2; z <= 2.2; z += 0.38) {
    const isTurquoise = Math.abs(z) % 0.8 < 0.3;
    const tBox = box(
      `toolbox-${z.toFixed(2)}`,
      [0.35, 0.26, 0.32],
      [-1.1, 0.14 + 0.29, -0.4 + z],
      isTurquoise ? 'totalTurquoise' : 'industrialYellow',
      'tooling-storage',
    );
    services['tooling-storage'].add(tBox);
  }

  // Spray cans & hardware bottles on upper shelf
  for (let z = -2.2; z <= -0.5; z += 0.14) {
    const can = cylinder(`can-${z.toFixed(2)}`, 0.035, 0.18, [-1.02, 0.14 + 0.8, -0.4 + z], 'screen', 'tooling-storage');
    services['tooling-storage'].add(can);
  }

  // 4. OPERATOR WORKSTATION DESK (Woodworking / CNC workstation)
  const desk = box('cnc-desk', [0.9, 0.05, 1.2], [0.3, 0.89, -1.0], 'wood', 'woodworking');
  services['woodworking'].add(desk);

  const deskLeg1 = box('cnc-desk-leg1', [0.06, 0.86, 0.06], [-0.1, 0.43, -1.55], 'darkSteel', 'woodworking');
  const deskLeg2 = box('cnc-desk-leg2', [0.06, 0.86, 0.06], [0.7, 0.43, -1.55], 'darkSteel', 'woodworking');
  const deskLeg3 = box('cnc-desk-leg3', [0.06, 0.86, 0.06], [-0.1, 0.43, -0.45], 'darkSteel', 'woodworking');
  const deskLeg4 = box('cnc-desk-leg4', [0.06, 0.86, 0.06], [0.7, 0.43, -0.45], 'darkSteel', 'woodworking');
  services['woodworking'].add(deskLeg1, deskLeg2, deskLeg3, deskLeg4);

  const monitor = box('cnc-monitor', [0.05, 0.36, 0.52], [0.3, 1.19, -0.9], 'screen', 'woodworking');
  const monitorStand = box('cnc-monitor-stand', [0.15, 0.12, 0.15], [0.3, 0.98, -0.9], 'darkSteel', 'woodworking');
  const keyboard = box('cnc-keyboard', [0.18, 0.02, 0.42], [0.55, 0.92, -0.9], 'darkSteel', 'woodworking');
  const stool = cylinder('cnc-stool', 0.16, 0.04, [0.95, 0.66, -0.9], 'wood', 'woodworking');
  const stoolLeg = cylinder('cnc-stool-leg', 0.03, 0.64, [0.95, 0.32, -0.9], 'darkSteel', 'woodworking');
  services['woodworking'].add(monitor, monitorStand, keyboard, stool, stoolLeg);

  // 5. WOODWORKING: BLUE ELEPHANT ELECNC1212 ROUTER (Inside container, right side)
  const cncBase = box('cnc-base', [1.6, 0.62, 1.4], [0.2, 0.45, 1.2], 'industrialYellow', 'woodworking');
  services['woodworking'].add(cncBase);

  // 4 Heavy CNC Stand Legs
  const cncLegs = [
    [-0.55, 0.22, 0.55],
    [0.95, 0.22, 0.55],
    [-0.55, 0.22, 1.85],
    [0.95, 0.22, 1.85],
  ] as const;
  cncLegs.forEach(([x, y, z], idx) => {
    services['woodworking'].add(box(`cnc-leg-${idx}`, [0.12, 0.44, 0.12], [x, y, z], 'containerBlue', 'woodworking'));
  });

  const cncBed = box('cnc-bed', [1.35, 0.08, 1.2], [0.2, 0.8, 1.2], 'darkSteel', 'woodworking');
  const cncWorkpiece = box('cnc-workpiece', [0.85, 0.04, 0.6], [0.2, 0.86, 1.2], 'wood', 'woodworking');
  const cncGantry = box('cnc-gantry-beam', [0.2, 0.25, 1.4], [0.2, 1.44, 1.2], 'darkSteel', 'woodworking');
  const cncSpindle = cylinder('cnc-spindle', 0.055, 0.3, [0.39, 1.19, 1.2], 'chrome', 'woodworking');
  services['woodworking'].add(cncBed, cncWorkpiece, cncGantry, cncSpindle);

  root.add(contGroup);

  // 6. BLUE ELEPHANT CO2 LASER CUTTER (Top Back Wall)
  const laserBase = box('laser-base', [1.9, 0.38, 1.35], [1.2, 0.19, -3.1], 'darkSteel', 'laser-cutting');
  const laserBody = box('laser-body', [1.88, 0.45, 1.32], [1.2, 0.6, -3.1], 'whiteEquipment', 'laser-cutting');
  const laserBed = box('laser-bed', [1.4, 0.02, 0.95], [1.08, 0.72, -3.1], 'darkSteel', 'laser-cutting');
  const laserCanopy = box('laser-canopy', [1.3, 0.03, 0.9], [1.08, 0.85, -3.1], 'glass', 'laser-cutting');
  const laserKeypad = box('laser-keypad', [0.22, 0.02, 0.16], [1.95, 0.84, -2.65], 'screen', 'laser-cutting');
  const laserExhaust = cylinder('laser-exhaust', 0.09, 1.2, [1.2, 1.45, -3.8], 'chrome', 'laser-cutting');
  laserExhaust.rotation.x = 0.5;
  services['laser-cutting'].add(laserBase, laserBody, laserBed, laserCanopy, laserKeypad, laserExhaust);

  // 7. METALWORKING: HEAVY-DUTY WORKBENCHES & VICES (Twin Central Islands)
  const bench1 = box('workbench-1', [3.0, 0.07, 1.1], [-0.6, 0.88, 1.2], 'wood', 'metalworking');
  const b1Legs = [
    [-0.6 - 1.4, 0.42, 1.2 - 0.45],
    [-0.6 + 1.4, 0.42, 1.2 - 0.45],
    [-0.6 - 1.4, 0.42, 1.2 + 0.45],
    [-0.6 + 1.4, 0.42, 1.2 + 0.45],
  ] as const;
  b1Legs.forEach(([x, y, z], idx) => {
    services['metalworking'].add(box(`b1-leg-${idx}`, [0.08, 0.84, 0.08], [x, y, z], 'darkSteel', 'metalworking'));
  });

  // Total Vice on Workbench 1
  const vice = box('bench-vice', [0.18, 0.13, 0.22], [0.65, 0.99, 1.55], 'viceGold', 'metalworking');
  const clampedTube = box('clamped-tube', [0.04, 0.04, 0.55], [0.65, 1.05, 1.65], 'darkSteel', 'metalworking');
  const welder = box('inverter-welder', [0.32, 0.24, 0.18], [-1.3, 1.03, 1.3], 'industrialYellow', 'metalworking');
  const grinder = box('angle-grinder', [0.28, 0.1, 0.1], [-0.2, 0.96, 1.0], 'totalTurquoise', 'metalworking');
  services['metalworking'].add(bench1, vice, clampedTube, welder, grinder);

  // Workbench 2
  const bench2 = box('workbench-2', [3.0, 0.07, 1.1], [3.0, 0.88, 1.2], 'wood', 'metalworking');
  const b2Legs = [
    [3.0 - 1.4, 0.42, 1.2 - 0.45],
    [3.0 + 1.4, 0.42, 1.2 - 0.45],
    [3.0 - 1.4, 0.42, 1.2 + 0.45],
    [3.0 + 1.4, 0.42, 1.2 + 0.45],
  ] as const;
  b2Legs.forEach(([x, y, z], idx) => {
    services['metalworking'].add(box(`b2-leg-${idx}`, [0.08, 0.84, 0.08], [x, y, z], 'darkSteel', 'metalworking'));
  });
  services['metalworking'].add(bench2);

  // 8. BLUE NUMBERED BADGES (1, 2, 3, 4) MATCHING DESIGN STUDIO REFERENCE
  atcLayout.stations.forEach((st) => {
    const sprite = createNumberSprite(st.id, st.number, st.service);
    sprite.position.set(st.position[0], st.position[1] + 0.75, st.position[2]);
    root.add(sprite);
    sprites.push(sprite);
  });

  function setLabelsVisible(visible: boolean) {
    sprites.forEach((s) => {
      s.visible = visible;
    });
  }

  // Populate nodes & selectable arrays
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
