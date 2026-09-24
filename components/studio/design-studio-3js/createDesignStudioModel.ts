import * as THREE from 'three';

import { studioLayout, type ServiceId } from './studioLayout';
import { createTextileStations } from './createTextileStations';
import { createBambuEnclosed, createBambuOpen, createFilamentUnit, createPrusaPrinter } from './realisticProps';

type MaterialKey =
  | 'floor'
  | 'wall'
  | 'wood'
  | 'charcoal'
  | 'yellow'
  | 'screen'
  | 'metal'
  | 'whiteboard'
  | 'blue'
  | 'glass'
  | 'orange'
  | 'red'
  | 'darkWood'
  | 'fabric';

export type StudioRuntime = {
  nodes: Record<string, THREE.Object3D>;
  services: Record<ServiceId, THREE.Group>;
  selectable: THREE.Object3D[];
};

const palette: Record<MaterialKey, THREE.MeshStandardMaterial> = {
  floor: new THREE.MeshStandardMaterial({ color: 0xece8db, roughness: 0.29, metalness: 0.02 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xe7e4d9, roughness: 0.84 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xc7a27e, roughness: 0.48 }),
  charcoal: new THREE.MeshStandardMaterial({ color: 0x30383a, roughness: 0.56, metalness: 0.06 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xf2c316, roughness: 0.42 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x10191e, roughness: 0.18, metalness: 0.12 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xa4aaab, roughness: 0.32, metalness: 0.72 }),
  whiteboard: new THREE.MeshStandardMaterial({ color: 0xf4f3ec, roughness: 0.24, metalness: 0.04 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x00508f, roughness: 0.38 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x8fb7c9, roughness: 0.16, metalness: 0.06, transparent: true, opacity: 0.48 }),
  orange: new THREE.MeshStandardMaterial({ color: 0xf07c22, roughness: 0.4 }),
  red: new THREE.MeshStandardMaterial({ color: 0xc23b2a, roughness: 0.5 }),
  darkWood: new THREE.MeshStandardMaterial({ color: 0x77452f, roughness: 0.46 }),
  fabric: new THREE.MeshStandardMaterial({ color: 0x767d7d, roughness: 0.91 }),
};

function createWoodGrain(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.fillStyle = '#e4dbce';
  context.fillRect(0, 0, 256, 512);
  for (let x = 0; x < 256; x += 1) {
    const wave = Math.sin(x * 0.11) * 3 + Math.sin(x * 0.031) * 8;
    const value = 185 + Math.floor(26 * Math.sin(x * 0.42 + wave) + 13 * Math.sin(x * 0.08));
    context.fillStyle = `rgba(73, 40, 23, ${Math.max(0.015, (220 - value) / 450)})`;
    context.fillRect(x, 0, 1, 512);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.anisotropy = 4;
  return texture;
}
function prepareMesh(mesh: THREE.Mesh, service?: ServiceId): THREE.Mesh {
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
  service?: ServiceId,
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
  service?: ServiceId,
  radialSegments = 24,
): THREE.Mesh {
  const mesh = prepareMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radialSegments), palette[material].clone()),
    service,
  );
  mesh.name = name;
  mesh.position.set(...position);
  return mesh;
}

function markService(group: THREE.Object3D, service: ServiceId): void {
  group.userData.service = service;
  group.traverse((node) => {
    node.userData.service = service;
  });
}

function createNumberSprite(tableId: string, number: number): THREE.Sprite {
  let map: THREE.CanvasTexture | undefined;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, 128, 128);
      context.fillStyle = '#00508f';
      context.beginPath();
      context.arc(64, 64, 56, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#ffffff';
      context.font = '700 62px Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(String(number), 64, 67);
      map = new THREE.CanvasTexture(canvas);
      map.colorSpace = THREE.SRGBColorSpace;
    }
  }
  const spriteMaterial = map
    ? new THREE.SpriteMaterial({ map, color: 0xffffff, depthTest: false })
    : new THREE.SpriteMaterial({ color: 0x00508f, depthTest: false });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.name = `${tableId}-number-sprite`;
  sprite.position.set(0, 1.19, 0);
  sprite.scale.set(0.38, 0.38, 0.38);
  sprite.renderOrder = 20;
  sprite.userData.tableNumber = number;
  sprite.userData.service = 'co-working';
  return sprite;
}

function createRoomShell(): THREE.Group {
  const room = new THREE.Group();
  room.name = 'room-shell';

  room.add(box('floor', [10.8, 0.12, 7.4], [0, 0.02, 0], 'floor'));
  room.add(box('south-wall', [10.8, 1.5, 0.12], [0, 0.75, 3.64], 'wall'));
  room.add(box('east-wall-low', [0.12, 1.28, 7.4], [5.34, 0.64, 0], 'wall'));
  room.add(box('east-wall-header', [0.12, 0.42, 7.4], [5.34, 2.99, 0], 'wall'));
  room.add(box('east-wall-north-jamb', [0.12, 1.3, 1.06], [5.34, 2.04, -3.17], 'wall'));
  room.add(box('east-wall-south-jamb', [0.12, 1.3, 1.06], [5.34, 2.04, 3.17], 'wall'));
  room.add(box('north-sill', [10.8, 0.38, 0.12], [0, 0.19, -3.64], 'wall'));
  room.add(box('west-sill', [0.12, 0.38, 5.98], [-5.34, 0.19, 0.71], 'wall'));

  const tileLines: number[] = [];
  for (let x = -5.4; x <= 5.4; x += 0.9) tileLines.push(x, 0.086, -3.7, x, 0.086, 3.7);
  for (let z = -3.7; z <= 3.7; z += 0.9) tileLines.push(-5.4, 0.086, z, 5.4, 0.086, z);
  const tileGeometry = new THREE.BufferGeometry();
  tileGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tileLines, 3));
  const tiles = new THREE.LineSegments(
    tileGeometry,
    new THREE.LineBasicMaterial({ color: 0xb9b6ae, transparent: true, opacity: 0.55 }),
  );
  tiles.name = 'floor-tile-grid';
  room.add(tiles);

  const skirting = [
    box('south-skirting', [10.65, 0.09, 0.07], [0, 0.13, 3.55], 'charcoal'),
    box('east-skirting', [0.07, 0.09, 7.25], [5.25, 0.13, 0], 'charcoal'),
  ];
  room.add(...skirting);
  return room;
}

function createDoor(): THREE.Group {
  const door = new THREE.Group();
  door.name = 'entry-door';
  door.position.set(-5.28, 0, -2.9);
  door.add(box('door-post-left', [0.12, 2.35, 0.08], [0, 1.18, -0.57], 'charcoal', 'design'));
  door.add(box('door-post-right', [0.12, 2.35, 0.08], [0, 1.18, 0.57], 'charcoal', 'design'));
  door.add(box('door-header', [0.12, 0.08, 1.22], [0, 2.33, 0], 'charcoal', 'design'));

  const leafPivot = new THREE.Group();
  leafPivot.name = 'door-hinge-pivot';
  leafPivot.position.set(0.08, 0, -0.52);
  leafPivot.rotation.y = Math.PI * 0.34;
  const leaf = box('door-leaf', [0.07, 2.18, 1.0], [0, 1.1, 0.5], 'wood', 'design');
  leafPivot.add(leaf);
  door.add(leafPivot);
  return door;
}

function createWindowRun(): THREE.Group {
  const windows = new THREE.Group();
  windows.name = 'window-run';
  const frameY = 2.06;
  const paneHeight = 0.82;
  const zValues = [-1.7, -0.85, 0, 0.85, 1.7];
  for (const [index, z] of zValues.entries()) {
    windows.add(box(`window-pane-${index + 1}`, [0.045, paneHeight, 0.72], [-5.3, frameY, z], 'glass'));
    windows.add(box(`window-mullion-${index + 1}`, [0.08, paneHeight + 0.1, 0.05], [-5.25, frameY, z - 0.4], 'metal'));
    for (let slat = -2; slat <= 2; slat += 1) {
      windows.add(box(`louvre-${index + 1}-${slat + 3}`, [0.05, 0.025, 0.66], [-5.22, frameY + slat * 0.14, z], 'metal'));
    }
  }
  windows.add(box('window-header', [0.1, 0.08, 4.45], [-5.25, 2.51, 0], 'metal'));
  windows.add(box('window-sill', [0.16, 0.08, 4.45], [-5.22, 1.6, 0], 'whiteboard'));
  return windows;
}

function createElectronicsWindow(): THREE.Group {
  const window = new THREE.Group();
  window.name = 'electronics-window';
  const x = 5.28;
  const y = 2.05;
  const paneZ = [-1.8, -0.6, 0.6, 1.8];
  for (const [index, z] of paneZ.entries()) {
    window.add(box(`electronics-window-pane-${index + 1}`, [0.045, 1.28, 1.12], [x, y, z], 'glass'));
    window.add(box(`electronics-window-mullion-${index + 1}`, [0.08, 1.36, 0.055], [x - 0.01, y, z - 0.6], 'metal'));
  }
  for (let band = 0; band < 8; band += 1) {
    window.add(box(`electronics-zebra-blind-${band + 1}`, [0.025, 0.075, 4.85], [x - 0.065, 1.55 + band * 0.14, 0], 'fabric'));
  }
  window.add(box('electronics-window-top-frame', [0.08, 0.08, 4.9], [x, 2.73, 0], 'metal'));
  window.add(box('electronics-window-sill', [0.16, 0.08, 4.9], [x - 0.03, 1.37, 0], 'whiteboard'));
  return window;
}

function createWorktable(id: string, number: number, x: number, z: number): THREE.Group {
  const table = new THREE.Group();
  table.name = id;
  table.position.set(x, 0, z);
  table.userData.label = `Worktable ${number}`;

  table.add(box(`${id}-top`, [2.25, 0.12, 0.92], [0, 0.91, 0], 'wood', 'co-working'));
  table.add(box(`${id}-base-left`, [0.13, 0.78, 0.72], [-0.86, 0.46, 0], 'charcoal', 'co-working'));
  table.add(box(`${id}-base-right`, [0.13, 0.78, 0.72], [0.86, 0.46, 0], 'charcoal', 'co-working'));
  table.add(box(`${id}-base-back`, [1.85, 0.68, 0.1], [0, 0.48, 0.29], 'charcoal', 'co-working'));
  table.add(box(`${id}-shelf`, [1.7, 0.08, 0.62], [0, 0.29, 0], 'charcoal', 'co-working'));
  table.add(box(`${id}-yellow-bin`, [0.54, 0.28, 0.46], [0.45, 0.48, -0.33], 'yellow', 'co-working'));

  table.add(createNumberSprite(id, number));
  markService(table, 'co-working');
  return table;
}

function createStool(name: string, x: number, z: number): THREE.Group {
  const stool = new THREE.Group();
  stool.name = name;
  stool.position.set(x, 0, z);
  const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.085, 10, 34, Math.PI * 1.55), palette.charcoal.clone());
  cushion.name = `${name}-open-back-cushion`;
  cushion.position.set(0, 0.91, -0.1);
  cushion.rotation.x = -0.22;
  cushion.castShadow = true;
  cushion.userData.service = 'co-working';
  stool.add(cushion);
  stool.add(cylinder(`${name}-seat`, 0.27, 0.09, [0, 0.67, 0], 'charcoal', 'co-working', 36));
  stool.add(cylinder(`${name}-stem`, 0.035, 0.55, [0, 0.37, 0], 'metal', 'co-working', 14));
  stool.add(cylinder(`${name}-base`, 0.23, 0.035, [0, 0.08, 0], 'metal', 'co-working', 32));
  markService(stool, 'co-working');
  return stool;
}

function createFabricChair(name: string, x: number, z: number): THREE.Group {
  const chair = new THREE.Group();
  chair.name = name;
  chair.position.set(x, 0, z);
  chair.add(box(`${name}-seat`, [0.45, 0.11, 0.44], [0, 0.58, 0], 'fabric', 'co-working'));
  const back = box(`${name}-back`, [0.46, 0.47, 0.09], [0, 0.91, -0.2], 'fabric', 'co-working');
  back.rotation.x = -0.1;
  chair.add(back);
  chair.add(cylinder(`${name}-stem`, 0.035, 0.48, [0, 0.32, 0], 'charcoal', 'co-working'));
  for (let i = 0; i < 5; i += 1) {
    const foot = box(`${name}-foot-${i}`, [0.04, 0.035, 0.25], [0, 0.09, 0.12], 'charcoal', 'co-working');
    foot.rotation.y = i * Math.PI * 2 / 5;
    chair.add(foot);
  }
  markService(chair, 'co-working');
  return chair;
}

function createComputer(name: string, x: number, z: number, rotationY = 0): THREE.Group {
  const computer = new THREE.Group();
  computer.name = name;
  computer.position.set(x, 0, z);
  computer.rotation.y = rotationY;
  computer.add(box(`${name}-monitor`, [0.58, 0.38, 0.055], [0, 1.23, 0], 'screen', 'design'));
  computer.add(box(`${name}-stand`, [0.06, 0.24, 0.06], [0, 0.98, 0], 'metal', 'design'));
  computer.add(box(`${name}-foot`, [0.28, 0.025, 0.15], [0, 0.86, 0.06], 'charcoal', 'design'));
  computer.add(box(`${name}-keyboard`, [0.42, 0.025, 0.16], [0, 0.86, 0.34], 'charcoal', 'design'));
  markService(computer, 'design');
  return computer;
}

function createComputerStations(): THREE.Group {
  const station = new THREE.Group();
  station.name = 'computer-stations';
  station.add(box('computer-counter', [3.1, 0.1, 0.72], [-2.45, 0.82, -3.12], 'wood', 'design'));
  station.add(box('computer-counter-base', [3.0, 0.76, 0.52], [-2.45, 0.41, -3.28], 'charcoal', 'design'));
  [-3.35, -2.45, -1.55].forEach((x, index) => station.add(createComputer(`computer-${index + 1}`, x, -3.0)));
  markService(station, 'design');
  return station;
}

function createPrinterStation(): THREE.Group {
  const station = new THREE.Group();
  station.name = '3d-printer-station';
  /* 2026-09-24: casting and moulding shares the rack's lowest shelf. */
  const lowerShelf = new THREE.Group();
  lowerShelf.name = 'printer-lower-shelf-bay';
  lowerShelf.add(box('printer-lower-shelf', [3.45, 0.1, 0.86], [2.05, 0.78, -3.1], 'wood', 'three-d-printing'));
  station.add(lowerShelf);
  station.add(box('printer-upper-shelf', [3.45, 0.1, 0.86], [2.05, 1.8, -3.1], 'wood', 'three-d-printing'));
  for (const x of [0.37, 3.73]) {
    station.add(box(`printer-rack-post-${x}`, [0.055, 1.78, 0.06], [x, 0.95, -3.42], 'charcoal', 'three-d-printing'));
    station.add(box(`printer-rack-front-post-${x}`, [0.055, 1.78, 0.06], [x, 0.95, -2.78], 'charcoal', 'three-d-printing'));
  }
  for (const [index, x] of [1.02, 2.05, 3.08].entries()) {
    station.add(createPrusaPrinter(`prusa-printer-${index + 1}`, x, 1.86, -3.1));
  }
  lowerShelf.add(createBambuOpen('bambu-open-printer', 1.02, 0.84, -3.1));
  lowerShelf.add(createBambuEnclosed('bambu-enclosed-printer', 2.05, 0.84, -3.1));
  lowerShelf.add(createFilamentUnit('bambu-filament-unit', 3.08, 0.84, -3.1));
  markService(station, 'three-d-printing');
  lowerShelf.traverse((node) => {
    node.userData.alsoService = 'casting-moulding';
  });
  return station;
}

function createElectronicsCupboards(): THREE.Group {
  const run = new THREE.Group();
  run.name = 'electronics-cupboards';
  const zValues = [-1.95, -0.65, 0.65, 1.95];
  for (const [index, z] of zValues.entries()) {
    run.add(box(`cupboard-${index + 1}`, [0.66, 0.78, 1.16], [4.96, 0.43, z], 'darkWood', 'electronics'));
    run.add(box(`cupboard-door-left-${index + 1}`, [0.026, 0.67, 0.51], [4.6, 0.43, z - 0.28], 'darkWood', 'electronics'));
    run.add(box(`cupboard-door-right-${index + 1}`, [0.026, 0.67, 0.51], [4.6, 0.43, z + 0.28], 'darkWood', 'electronics'));
    run.add(box(`cupboard-handle-left-${index + 1}`, [0.025, 0.025, 0.16], [4.57, 0.64, z - 0.13], 'metal', 'electronics'));
    run.add(box(`cupboard-handle-right-${index + 1}`, [0.025, 0.025, 0.16], [4.57, 0.64, z + 0.13], 'metal', 'electronics'));
  }
  run.add(box('electronics-worktop', [0.78, 0.1, 5.18], [4.96, 0.87, 0], 'wood', 'electronics'));
  markService(run, 'electronics');
  return run;
}

function createPresentationWall(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'presentation-wall';
  const tv = new THREE.Group();
  tv.name = 'tv-rolling-stand';
  tv.add(box('tv-display', [1.3, 0.78, 0.08], [-1.45, 1.72, 3.3], 'screen', 'design'));
  tv.add(box('tv-stand-post', [0.07, 1.18, 0.07], [-1.45, 0.94, 3.26], 'metal', 'design'));
  tv.add(box('tv-stand-cross-foot', [0.82, 0.055, 0.44], [-1.45, 0.28, 3.25], 'charcoal', 'design'));
  for (const [index, x] of [-1.78, -1.12].entries()) {
    const wheel = cylinder(`tv-wheel-${index + 1}`, 0.09, 0.055, [x, 0.14, 3.13], 'charcoal', 'design', 18);
    wheel.rotation.z = Math.PI / 2;
    tv.add(wheel);
  }
  group.add(tv);

  const board = new THREE.Group();
  board.name = 'whiteboard-rolling-stand';
  board.add(box('whiteboard', [2.18, 1.08, 0.07], [1.5, 1.72, 3.3], 'whiteboard', 'design'));
  board.add(box('whiteboard-frame-top', [2.28, 0.035, 0.1], [1.5, 2.28, 3.29], 'metal', 'design'));
  board.add(box('whiteboard-frame-bottom', [2.28, 0.035, 0.1], [1.5, 1.16, 3.29], 'metal', 'design'));
  for (const x of [0.52, 2.48]) {
    board.add(box(`whiteboard-post-${x}`, [0.055, 1.2, 0.055], [x, 0.66, 3.25], 'metal', 'design'));
    board.add(box(`whiteboard-foot-${x}`, [0.5, 0.055, 0.36], [x, 0.21, 3.23], 'charcoal', 'design'));
    const wheel = cylinder(`whiteboard-wheel-${x}`, 0.08, 0.05, [x, 0.1, 3.1], 'charcoal', 'design', 18);
    wheel.rotation.z = Math.PI / 2;
    board.add(wheel);
  }
  group.add(board);
  group.add(box('air-conditioner', [1.2, 0.32, 0.3], [1.5, 2.62, 3.39], 'whiteboard', 'design'));
  group.add(box('ac-vent', [0.92, 0.035, 0.035], [1.5, 2.51, 3.22], 'charcoal', 'design'));
  markService(group, 'design');
  return group;
}

function createTeacherStation(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'teacher-station';
  group.add(box('teacher-worktop', [2.0, 0.1, 0.84], [-4.0, 0.82, 3.02], 'wood', 'design'));
  group.add(box('teacher-base-left', [0.52, 0.76, 0.66], [-4.63, 0.41, 3.05], 'charcoal', 'design'));
  group.add(box('teacher-base-right', [0.52, 0.76, 0.66], [-3.37, 0.41, 3.05], 'charcoal', 'design'));
  group.add(createComputer('teacher-computer-left', -4.38, 2.7, Math.PI));
  group.add(createComputer('teacher-computer-right', -3.65, 2.7, Math.PI));
  markService(group, 'design');
  return group;
}

export function createDesignStudioModel(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'cdie-design-studio';
  const grain = createWoodGrain();
  if (grain) {
    palette.wood.map = grain;
    palette.darkWood.map = grain;
    root.userData.generatedTextures = [grain];
  }

  const services: StudioRuntime['services'] = {
    design: new THREE.Group(),
    'co-working': new THREE.Group(),
    'three-d-printing': new THREE.Group(),
    electronics: new THREE.Group(),
    textiles: new THREE.Group(),
    // Holds no meshes of its own: it lights the 3D printing rack's lowest
    // shelf (userData.alsoService), so the camera centre is set here.
    'casting-moulding': new THREE.Group(),
  };
  services['casting-moulding'].userData.centre = new THREE.Vector3(2.05, 1.1, -3.1);
  for (const [id, group] of Object.entries(services)) {
    group.name = `service-${id}`;
    group.userData.service = id;
    root.add(group);
  }

  const room = createRoomShell();
  const windows = createWindowRun();
  const electronicsWindow = createElectronicsWindow();
  root.add(room, windows, electronicsWindow);
  services.design.add(createDoor(), createComputerStations(), createPresentationWall(), createTeacherStation());
  services['three-d-printing'].add(createPrinterStation());
  services.electronics.add(createElectronicsCupboards());
  const textileStations = createTextileStations();
  markService(textileStations, 'textiles');
  services.textiles.add(textileStations);

  for (const tableData of studioLayout.tables) {
    const table = createWorktable(tableData.id, tableData.number, tableData.x, tableData.z);
    services['co-working'].add(table);
    const stoolPositions = [
      [tableData.x - 0.74, tableData.z - 0.78],
      [tableData.x + 0.74, tableData.z - 0.78],
      [tableData.x, tableData.z + 0.78],
    ] as const;
    stoolPositions.forEach(([x, z], index) => {
      services['co-working'].add(index === 2 && tableData.number % 2 === 0
        ? createFabricChair(`${tableData.id}-fabric-chair-${index + 1}`, x, z)
        : createStool(`${tableData.id}-stool-${index + 1}`, x, z));
    });
  }

  const nodes: Record<string, THREE.Object3D> = {};
  const selectable: THREE.Object3D[] = [];
  root.traverse((node) => {
    if (node.name) nodes[node.name] = node;
    if (node.userData.service && node instanceof THREE.Mesh) selectable.push(node);
  });

  const runtime: StudioRuntime = { nodes, services, selectable };
  root.userData.sculptRuntime = runtime;
  root.userData.approximate = true;
  root.userData.sourceAuthority = 'user-supplied-floorplan-room-photos-and-IMG_0926.MOV';
  return root;
}
