import * as THREE from 'three';

export type PropMaterial = 'black' | 'dark' | 'orange' | 'white' | 'steel' | 'glass' | 'screen' | 'red' | 'spool' | 'wood' | 'yellow';

const materials: Record<PropMaterial, THREE.MeshStandardMaterial> = {
  black: new THREE.MeshStandardMaterial({ color: 0x151719, roughness: 0.48, metalness: 0.08 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x34383a, roughness: 0.38, metalness: 0.24 }),
  orange: new THREE.MeshStandardMaterial({ color: 0xe75b1f, roughness: 0.32 }),
  white: new THREE.MeshStandardMaterial({ color: 0xe9e8e1, roughness: 0.42 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb2b8b9, roughness: 0.26, metalness: 0.78 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x81949c, roughness: 0.1, metalness: 0.08, transparent: true, opacity: 0.28, depthWrite: false }),
  screen: new THREE.MeshStandardMaterial({ color: 0x18252b, roughness: 0.12, metalness: 0.12, emissive: 0x0b1820, emissiveIntensity: 0.25 }),
  red: new THREE.MeshStandardMaterial({ color: 0xa72827, roughness: 0.38 }),
  spool: new THREE.MeshStandardMaterial({ color: 0x282b30, roughness: 0.56 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xb49270, roughness: 0.52 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xf2c316, roughness: 0.42 }),
};

export function propBox(name: string, size: [number, number, number], position: [number, number, number], material: PropMaterial, service?: string): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), materials[material].clone());
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (service) mesh.userData.service = service;
  return mesh;
}
export function propCylinder(name: string, radius: number, height: number, position: [number, number, number], material: PropMaterial, service?: string, segments = 32): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), materials[material].clone());
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (service) mesh.userData.service = service;
  return mesh;
}

export function badge(name: string, label: string, width: number, position: [number, number, number], service?: string, color = '#f5f4ed'): THREE.Mesh | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.clearRect(0, 0, 512, 128);
  context.fillStyle = color;
  context.font = 'bold 57px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 256, 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 4), new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide }));
  mesh.name = name;
  mesh.position.set(...position);
  if (service) mesh.userData.service = service;
  return mesh;
}

function addBadge(group: THREE.Group, name: string, label: string, width: number, position: [number, number, number]) {
  const mesh = badge(name, label, width, position, 'three-d-printing');
  if (mesh) group.add(mesh);
}

export function createPrusaPrinter(name: string, x: number, y: number, z: number): THREE.Group {
  const printer = new THREE.Group();
  printer.name = name;
  printer.position.set(x, y, z);
  const s = 'three-d-printing';
  printer.add(propBox(`${name}-base`, [0.7, 0.075, 0.58], [0, 0.04, 0], 'black', s));
  printer.add(propBox(`${name}-bed`, [0.54, 0.025, 0.42], [0, 0.14, 0.04], 'dark', s));
  for (const side of [-1, 1]) {
    printer.add(propBox(`${name}-upright-${side}`, [0.055, 0.57, 0.055], [side * 0.3, 0.45, -0.22], 'black', s));
    printer.add(propBox(`${name}-lead-screw-${side}`, [0.011, 0.57, 0.011], [side * 0.27, 0.45, -0.17], 'steel', s));
    printer.add(propBox(`${name}-orange-guide-${side}`, [0.085, 0.075, 0.08], [side * 0.3, 0.55, -0.2], 'orange', s));
  }
  printer.add(propBox(`${name}-top`, [0.68, 0.075, 0.07], [0, 0.77, -0.22], 'black', s));
  printer.add(propBox(`${name}-gantry`, [0.55, 0.035, 0.05], [0, 0.55, -0.15], 'steel', s));
  printer.add(propBox(`${name}-toolhead`, [0.16, 0.16, 0.13], [-0.08, 0.51, -0.09], 'black', s));
  printer.add(propCylinder(`${name}-fan`, 0.055, 0.025, [-0.08, 0.5, -0.005], 'dark', s));
  printer.add(propBox(`${name}-control`, [0.3, 0.1, 0.11], [0.17, 0.09, 0.34], 'orange', s));
  printer.add(propBox(`${name}-control-screen`, [0.14, 0.035, 0.007], [0.12, 0.1, 0.401], 'screen', s));
  printer.add(propBox(`${name}-top-spool-rail`, [0.32, 0.028, 0.03], [0, 0.99, -0.22], 'black', s));
  printer.add(propBox(`${name}-top-spool-post`, [0.03, 0.2, 0.03], [0, 0.88, -0.22], 'black', s));
  addBadge(printer, `${name}-prusa-badge`, 'PRUSA', 0.23, [0, 0.78, -0.178]);
  addBadge(printer, `${name}-control-badge`, 'ORIGINAL PRUSA', 0.21, [0.16, 0.065, 0.398]);
  printer.userData.service = s;
  return printer;
}

export function createBambuOpen(name: string, x: number, y: number, z: number): THREE.Group {
  const printer = new THREE.Group();
  printer.name = name;
  printer.position.set(x, y, z);
  const s = 'three-d-printing';
  printer.add(propBox(`${name}-base`, [0.66, 0.075, 0.6], [0, 0.04, 0], 'white', s));
  printer.add(propBox(`${name}-bed`, [0.48, 0.025, 0.39], [0, 0.18, 0], 'dark', s));
  printer.add(propBox(`${name}-left-upright`, [0.045, 0.57, 0.045], [-0.29, 0.39, -0.22], 'steel', s));
  printer.add(propBox(`${name}-right-upright`, [0.045, 0.57, 0.045], [0.29, 0.39, -0.22], 'steel', s));
  printer.add(propBox(`${name}-top-gantry`, [0.62, 0.055, 0.075], [0, 0.69, -0.22], 'dark', s));
  printer.add(propBox(`${name}-cross-rail`, [0.55, 0.028, 0.035], [0, 0.47, -0.08], 'steel', s));
  printer.add(propBox(`${name}-toolhead`, [0.12, 0.17, 0.1], [-0.07, 0.43, -0.04], 'white', s));
  printer.add(propBox(`${name}-screen`, [0.17, 0.11, 0.023], [0.28, 0.15, 0.33], 'screen', s));
  const spool = propCylinder(`${name}-spool`, 0.14, 0.06, [-0.41, 0.33, 0], 'spool', s);
  spool.rotation.z = Math.PI / 2;
  printer.add(spool);
  addBadge(printer, `${name}-badge`, 'Bambu Lab', 0.19, [0.07, 0.075, 0.304]);
  printer.userData.service = s;
  return printer;
}

export function createBambuEnclosed(name: string, x: number, y: number, z: number): THREE.Group {
  const printer = new THREE.Group();
  printer.name = name;
  printer.position.set(x, y, z);
  const s = 'three-d-printing';
  printer.add(propBox(`${name}-base`, [0.7, 0.07, 0.64], [0, 0.04, 0], 'dark', s));
  printer.add(propBox(`${name}-roof`, [0.7, 0.09, 0.64], [0, 0.76, 0], 'dark', s));
  for (const side of [-1, 1]) {
    printer.add(propBox(`${name}-post-front-${side}`, [0.055, 0.69, 0.055], [side * 0.32, 0.4, 0.29], 'dark', s));
    printer.add(propBox(`${name}-post-back-${side}`, [0.055, 0.69, 0.055], [side * 0.32, 0.4, -0.29], 'dark', s));
  }
  printer.add(propBox(`${name}-front-door`, [0.59, 0.59, 0.02], [0, 0.39, 0.32], 'glass', s));
  printer.add(propBox(`${name}-side-glass`, [0.02, 0.58, 0.53], [-0.35, 0.4, 0], 'glass', s));
  printer.add(propBox(`${name}-build-plate`, [0.49, 0.028, 0.44], [0, 0.18, 0], 'dark', s));
  printer.add(propBox(`${name}-screen`, [0.19, 0.16, 0.025], [-0.2, 0.69, 0.334], 'screen', s));
  addBadge(printer, `${name}-badge`, 'Bambu Lab P2S', 0.28, [0.15, 0.69, 0.335]);
  printer.userData.service = s;
  return printer;
}

export function createFilamentUnit(name: string, x: number, y: number, z: number): THREE.Group {
  const unit = new THREE.Group();
  unit.name = name;
  unit.position.set(x, y, z);
  const s = 'three-d-printing';
  unit.add(propBox(`${name}-base`, [0.63, 0.19, 0.52], [0, 0.1, 0], 'black', s));
  unit.add(propBox(`${name}-lid`, [0.64, 0.19, 0.53], [0, 0.26, 0], 'glass', s));
  for (const offset of [-0.21, -0.07, 0.07, 0.21]) {
    const roll = propCylinder(`${name}-roll-${offset}`, 0.1, 0.045, [offset, 0.2, 0], 'spool', s);
    roll.rotation.z = Math.PI / 2;
    unit.add(roll);
  }
  addBadge(unit, `${name}-badge`, 'Bambu AMS 2', 0.27, [0, 0.105, 0.264]);
  unit.userData.service = s;
  return unit;
}
