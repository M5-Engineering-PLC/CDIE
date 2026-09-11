export type Vec3Tuple = readonly [number, number, number];

export type AtcServiceId =
  | 'woodworking'
  | 'tooling-storage'
  | 'laser-cutting'
  | 'metalworking'
  | 'facility-access';

export type AtcStationLayout = {
  id: string;
  number: 1 | 2 | 3 | 4;
  label: string;
  service: AtcServiceId;
  position: Vec3Tuple;
  size: Vec3Tuple;
  rotationY: number;
};

export type AtcLayout = {
  room: { width: number; depth: number; height: number };
  isMeasured: boolean;
  stations: readonly AtcStationLayout[];
};

export const requiredAtcStationIds = [
  'woodworking',
  'tools-cabinets',
  'laser-cutter',
  'metalworking',
] as const;

export const atcLayout: AtcLayout = {
  room: { width: 12.8, depth: 8.8, height: 2.6 },
  isMeasured: false,
  stations: [
    {
      id: 'woodworking',
      number: 1,
      label: 'Woodworking (CNC Router)',
      service: 'woodworking',
      position: [-3.8, 0.7, 0.9],
      size: [1.6, 1.2, 1.4],
      rotationY: 0,
    },
    {
      id: 'tools-cabinets',
      number: 2,
      label: 'Tools & Storage',
      service: 'tooling-storage',
      position: [-5.2, 1.1, -0.6],
      size: [0.6, 2.1, 5.2],
      rotationY: 0,
    },
    {
      id: 'laser-cutter',
      number: 3,
      label: 'Laser Cutting',
      service: 'laser-cutting',
      position: [1.2, 0.6, -3.1],
      size: [1.9, 0.9, 1.35],
      rotationY: 0,
    },
    {
      id: 'metalworking',
      number: 4,
      label: 'Metalworking (Workbenches)',
      service: 'metalworking',
      position: [-0.6, 0.6, 1.2],
      size: [3.0, 0.9, 1.1],
      rotationY: 0,
    },
  ],
};
