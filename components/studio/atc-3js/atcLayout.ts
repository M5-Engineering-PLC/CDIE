export type Vec3Tuple = readonly [number, number, number];

export type AtcServiceId =
  | 'woodworking'
  | 'tooling-storage'
  | 'laser-cutting'
  | 'metalworking'
  | 'facility-access';

export type AtcStationLayout = {
  id: string;
  number?: 1 | 2 | 3 | 4 | 5;
  label: string;
  service: AtcServiceId;
  position: Vec3Tuple;
  size: Vec3Tuple;
  rotationY: number;
};

export type AtcLayout = {
  room: { width: number; depth: number; height: number };
  container: { position: Vec3Tuple; size: Vec3Tuple };
  isMeasured: boolean;
  stations: readonly AtcStationLayout[];
};

export const requiredAtcStationIds = [
  'metalworking-bench-a',
  'metalworking-bench-b',
  'woodworking-cnc',
  'woodworking-assembly',
  'laser-cutter',
] as const;

export const atcLayout: AtcLayout = {
  room: { width: 12.8, depth: 8.8, height: 4.15 },
  // Retained from the prior ATC room model. These dimensions are illustrative.
  container: { position: [-4.4, 0, -0.2], size: [3.4, 2.4, 6.4] },
  isMeasured: false,
  stations: [
    {
      id: 'metalworking-bench-a',
      number: 1,
      label: 'Metalworking bench 1',
      service: 'metalworking',
      position: [-3.55, 0.48, -1.65],
      size: [2.65, 0.96, 1.16],
      rotationY: 0,
    },
    {
      id: 'metalworking-bench-b',
      number: 2,
      label: 'Metalworking bench 2',
      service: 'metalworking',
      position: [-3.55, 0.48, 1.25],
      size: [2.65, 0.96, 1.16],
      rotationY: 0,
    },
    {
      id: 'woodworking-cnc',
      number: 3,
      label: 'Woodworking CNC router',
      service: 'woodworking',
      position: [2.55, 0.78, 0.25],
      size: [4.8, 1.56, 2.9],
      rotationY: 0,
    },
    {
      id: 'woodworking-assembly',
      number: 4,
      label: 'Woodworking assembly table',
      service: 'woodworking',
      position: [3.5, 0.76, 3.05],
      size: [2.7, 0.92, 1.15],
      rotationY: 0,
    },
    {
      id: 'laser-cutter',
      number: 5,
      label: 'Laser cutting station',
      service: 'laser-cutting',
      position: [4.65, 0.74, -2.72],
      size: [1.95, 1.48, 1.7],
      rotationY: 0,
    },
    {
      id: 'tool-storage',
      label: 'Tool storage and blue work bays',
      service: 'tooling-storage',
      position: [-2.25, 1.3, -3.58],
      size: [6.55, 2.6, 1.18],
      rotationY: 0,
    },
  ],
};
