import * as THREE from 'three';

import { propBox, propCylinder } from './realisticProps';

/*
  Daily note 2026-09-25: "add moulding on the bottom shelf of the printers, and
  add the device as well". The 3D printing rack gains a third, floor-level
  shelf under the printers. It carries the casting and moulding work: a
  benchtop moulding unit (base, heater hood, clamp frame, control panel), two
  silicone mould blocks, a cast part and a resin bottle. Follow-up the same
  day: "the moulding lower bench needs the device with the yellow enclosure
  added, maintain everything else", so a second unit in a yellow housing
  (a lidded chamber with a window, latch and controls) sits beside the mould
  blocks and the rest stays where it was. Every mesh belongs to
  the casting-moulding service, so selecting it lights this shelf rather than
  the printers above it. Shapes are illustrative; no make or model is claimed.
*/

const SERVICE = 'casting-moulding';
const SHELF_Y = 0.16;
const TOP = SHELF_Y + 0.04;

function createMouldingDevice(name: string, x: number, z: number): THREE.Group {
  const unit = new THREE.Group();
  unit.name = name;
  unit.position.set(x, TOP, z);
  unit.add(propBox(`${name}-base`, [0.66, 0.18, 0.52], [0, 0.09, 0], 'dark', SERVICE));
  unit.add(propBox(`${name}-bed`, [0.5, 0.02, 0.38], [0, 0.19, 0.02], 'steel', SERVICE));
  unit.add(propBox(`${name}-clamp-frame`, [0.54, 0.03, 0.42], [0, 0.24, 0.02], 'black', SERVICE));
  for (const side of [-1, 1]) {
    unit.add(propBox(`${name}-post-${side}`, [0.04, 0.34, 0.04], [side * 0.3, 0.35, -0.22], 'steel', SERVICE));
  }
  unit.add(propBox(`${name}-hood`, [0.62, 0.11, 0.46], [0, 0.5, -0.02], 'black', SERVICE));
  unit.add(propBox(`${name}-heater`, [0.5, 0.02, 0.36], [0, 0.44, -0.02], 'orange', SERVICE));
  unit.add(propBox(`${name}-panel`, [0.2, 0.09, 0.02], [0.2, 0.1, 0.27], 'screen', SERVICE));
  unit.add(propCylinder(`${name}-dial`, 0.025, 0.02, [-0.18, 0.1, 0.27], 'red', SERVICE, 20));
  unit.userData.service = SERVICE;
  return unit;
}

function createYellowEnclosureDevice(name: string, x: number, z: number): THREE.Group {
  const unit = new THREE.Group();
  unit.name = name;
  unit.position.set(x, TOP, z);
  unit.add(propBox(`${name}-housing`, [0.56, 0.36, 0.46], [0, 0.18, 0], 'yellow', SERVICE));
  unit.add(propBox(`${name}-lid`, [0.5, 0.05, 0.4], [0, 0.385, 0], 'dark', SERVICE));
  unit.add(propBox(`${name}-window`, [0.3, 0.16, 0.01], [-0.06, 0.22, 0.235], 'glass', SERVICE));
  unit.add(propBox(`${name}-panel`, [0.12, 0.16, 0.01], [0.19, 0.22, 0.235], 'black', SERVICE));
  unit.add(propBox(`${name}-display`, [0.08, 0.04, 0.01], [0.19, 0.27, 0.242], 'screen', SERVICE));
  unit.add(propCylinder(`${name}-button-1`, 0.012, 0.012, [0.16, 0.19, 0.242], 'red', SERVICE, 12));
  unit.add(propCylinder(`${name}-button-2`, 0.012, 0.012, [0.22, 0.19, 0.242], 'white', SERVICE, 12));
  unit.add(propBox(`${name}-latch`, [0.08, 0.03, 0.02], [-0.06, 0.06, 0.24], 'steel', SERVICE));
  unit.add(propBox(`${name}-vent`, [0.2, 0.02, 0.3], [0, 0.415, 0], 'black', SERVICE));
  unit.userData.service = SERVICE;
  return unit;
}

function createMouldBlock(name: string, x: number, z: number, size: [number, number, number], material: 'white' | 'orange'): THREE.Mesh {
  return propBox(name, size, [x, TOP + size[1] / 2, z], material, SERVICE);
}

export function createMouldingShelf(): THREE.Group {
  const shelf = new THREE.Group();
  shelf.name = 'printer-bottom-shelf-bay';

  shelf.add(propBox('printer-bottom-shelf', [3.45, 0.08, 0.86], [2.05, SHELF_Y, -3.1], 'wood', SERVICE));
  shelf.add(createMouldingDevice('moulding-device', 1.02, -3.1));

  shelf.add(createMouldBlock('silicone-mould-1', 1.85, -3.18, [0.3, 0.12, 0.24], 'white'));
  shelf.add(createMouldBlock('silicone-mould-2', 2.2, -3.02, [0.26, 0.1, 0.2], 'orange'));

  shelf.add(createYellowEnclosureDevice('yellow-enclosure-device', 2.68, -3.1));

  const cast = propCylinder('resin-cast-part', 0.08, 0.26, [3.14, TOP + 0.13, -3.12], 'glass', SERVICE, 24);
  shelf.add(cast);
  const bottle = propCylinder('resin-bottle', 0.06, 0.3, [3.4, TOP + 0.15, -3.24], 'white', SERVICE, 20);
  shelf.add(bottle);
  shelf.add(propCylinder('resin-bottle-cap', 0.03, 0.04, [3.4, TOP + 0.32, -3.24], 'black', SERVICE, 16));
  shelf.add(createMouldBlock('mould-tray', 3.52, -2.92, [0.32, 0.04, 0.22], 'white'));

  shelf.userData.service = SERVICE;
  return shelf;
}
