import * as THREE from 'three';

import { badge, propBox, propCylinder } from './realisticProps';

function sewingMachine(name: string, x: number, z: number): THREE.Group {
  const station = new THREE.Group();
  station.name = name;
  station.position.set(x, 0, z);
  station.add(propBox(`${name}-table-top`, [1.5, 0.08, 0.8], [0, 0.77, 0], 'white'));
  station.add(propBox(`${name}-wood-edge`, [1.5, 0.035, 0.8], [0, 0.72, 0], 'wood'));
  for (const side of [-1, 1]) {
    station.add(propBox(`${name}-leg-${side}`, [0.07, 0.7, 0.58], [side * 0.58, 0.37, 0], 'steel'));
    station.add(propBox(`${name}-foot-${side}`, [0.4, 0.045, 0.07], [side * 0.58, 0.05, 0], 'steel'));
  }
  station.add(propBox(`${name}-crossbar`, [1.2, 0.05, 0.045], [0, 0.25, -0.27], 'steel'));
  station.add(propBox(`${name}-pedal`, [0.3, 0.025, 0.19], [0.25, 0.07, 0.25], 'dark'));
  station.add(propBox(`${name}-machine-bed`, [0.7, 0.04, 0.34], [0.04, 0.84, -0.05], 'steel'));
  station.add(propBox(`${name}-head-base`, [0.32, 0.32, 0.29], [0.32, 1.01, -0.06], 'white'));
  station.add(propBox(`${name}-long-arm`, [0.68, 0.17, 0.27], [-0.1, 1.18, -0.06], 'white'));
  station.add(propBox(`${name}-needle-housing`, [0.13, 0.26, 0.23], [-0.42, 1.01, -0.06], 'white'));
  station.add(propBox(`${name}-needle`, [0.008, 0.14, 0.008], [-0.43, 0.82, 0.02], 'steel'));
  station.add(propCylinder(`${name}-hand-wheel`, 0.12, 0.045, [0.53, 1.1, -0.06], 'dark'));
  station.add(propBox(`${name}-thread-post`, [0.015, 0.55, 0.015], [0.5, 1.46, -0.23], 'steel'));
  station.add(propBox(`${name}-thread-rail`, [0.55, 0.015, 0.015], [0.25, 1.73, -0.23], 'steel'));
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.075, 0.18, 24), new THREE.MeshStandardMaterial({ color: 0xe7e3dc, roughness: 0.93 }));
  cone.name = `${name}-thread-cone`;
  cone.position.set(0.5, 1.26, -0.23);
  cone.castShadow = true;
  station.add(cone);
  const logo = badge(`${name}-juki-badge`, 'JUKI', 0.2, [0.06, 1.19, 0.079], undefined, '#164d86');
  if (logo) station.add(logo);
  return station;
}

export function createTextileStations(): THREE.Group {
  const stations = new THREE.Group();
  stations.name = 'textile-stations';
  stations.userData.approximate = true;
  stations.userData.sourceMedia = ['IMG_0924.HEIC', 'IMG_0926.MOV'];
  for (const [index, z] of [0, 1.55].entries()) {
    const machine = sewingMachine(`juki-sewing-machine-${index + 1}`, -4.85, z);
    machine.rotation.y = Math.PI / 2;
    stations.add(machine);
  }
  return stations;
}
