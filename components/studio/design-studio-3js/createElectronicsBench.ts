import * as THREE from 'three';

import { propBox, propCylinder } from './realisticProps';

/*
  Follow-up 2026-09-25: "have one of the benches have a signal generator, power
  supply and oscilloscope, and have the autofocus come on that for
  electronics; it makes more sense than benches". Worktable 1 (studioLayout,
  the north-east table beside the printer rack) carries the three bench
  instruments. They belong to the electronics service, so selecting
  electronics lights them and the tour looks here rather than at the cupboard
  run. Shapes are illustrative; no make or model is claimed.
*/

const SERVICE = 'electronics';
/** worktable 1's centre, from studioLayout.tables */
const TABLE: [number, number] = [1.45, -1.25];
/** table top is 0.91 high and 0.12 thick */
const TOP = 0.97;

/** where the tour aims for electronics: the instruments, at eye level over the table */
export const electronicsBenchFocus: [number, number, number] = [TABLE[0], TOP + 0.1, TABLE[1] - 0.12];

function createOscilloscope(x: number, z: number): THREE.Group {
  const scope = new THREE.Group();
  scope.name = 'oscilloscope';
  scope.position.set(x, TOP, z);
  scope.add(propBox('oscilloscope-body', [0.38, 0.17, 0.14], [0, 0.085, 0], 'dark', SERVICE));
  scope.add(propBox('oscilloscope-screen', [0.2, 0.12, 0.01], [-0.06, 0.09, 0.075], 'screen', SERVICE));
  for (const [index, y] of [0.13, 0.09, 0.05].entries()) {
    scope.add(propCylinder(`oscilloscope-knob-${index + 1}`, 0.012, 0.015, [0.13, y, 0.075], 'white', SERVICE, 12));
  }
  scope.add(propBox('oscilloscope-feet', [0.34, 0.012, 0.12], [0, 0.006, 0], 'black', SERVICE));
  return scope;
}

function createSignalGenerator(x: number, z: number): THREE.Group {
  const unit = new THREE.Group();
  unit.name = 'signal-generator';
  unit.position.set(x, TOP, z);
  unit.add(propBox('signal-generator-body', [0.32, 0.11, 0.2], [0, 0.055, 0], 'white', SERVICE));
  unit.add(propBox('signal-generator-display', [0.12, 0.05, 0.01], [-0.07, 0.065, 0.105], 'screen', SERVICE));
  unit.add(propCylinder('signal-generator-dial', 0.022, 0.015, [0.09, 0.055, 0.105], 'dark', SERVICE, 16));
  for (const [index, offset] of [-0.13, -0.09].entries()) {
    unit.add(propCylinder(`signal-generator-output-${index + 1}`, 0.008, 0.02, [offset + 0.19, 0.03, 0.105], 'steel', SERVICE, 10));
  }
  return unit;
}

function createPowerSupply(x: number, z: number): THREE.Group {
  const unit = new THREE.Group();
  unit.name = 'bench-power-supply';
  unit.position.set(x, TOP, z);
  unit.add(propBox('power-supply-body', [0.24, 0.16, 0.24], [0, 0.08, 0], 'dark', SERVICE));
  unit.add(propBox('power-supply-display', [0.14, 0.04, 0.01], [-0.02, 0.12, 0.125], 'screen', SERVICE));
  unit.add(propCylinder('power-supply-knob', 0.016, 0.015, [0.08, 0.12, 0.125], 'white', SERVICE, 12));
  unit.add(propCylinder('power-supply-terminal-red', 0.012, 0.025, [-0.06, 0.04, 0.125], 'red', SERVICE, 12));
  unit.add(propCylinder('power-supply-terminal-black', 0.012, 0.025, [0.0, 0.04, 0.125], 'black', SERVICE, 12));
  unit.add(propCylinder('power-supply-terminal-earth', 0.012, 0.025, [0.06, 0.04, 0.125], 'steel', SERVICE, 12));
  return unit;
}

export function createElectronicsBench(): THREE.Group {
  const bench = new THREE.Group();
  bench.name = 'electronics-bench';
  const [x, z] = TABLE;
  bench.add(createOscilloscope(x - 0.62, z - 0.16));
  bench.add(createSignalGenerator(x + 0.02, z - 0.2));
  bench.add(createPowerSupply(x + 0.6, z - 0.18));
  bench.add(propBox('breadboard', [0.17, 0.012, 0.06], [x + 0.05, TOP + 0.006, z + 0.24], 'white', SERVICE));
  bench.userData.service = SERVICE;
  bench.traverse((node) => {
    node.userData.service = SERVICE;
  });
  return bench;
}
