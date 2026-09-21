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
  'metalworking',
  'woodworking',
  'laser-cutter',
  'tools-cabinets',
] as const;

export const atcLayout: AtcLayout = {
  room: { width: 12.8, depth: 8.8, height: 2.6 },
  isMeasured: false,
  stations: [
    {
      id: 'metalworking',
      number: 1,
      label: 'Metalworking (Workbenches & Tool Shed)',
      service: 'metalworking',
      position: [1.8, 0.85, 0.2],
      size: [3.8, 0.9, 3.2],
      rotationY: 0,
    },
    {
      id: 'woodworking',
      number: 2,
      label: 'Woodworking (CNC Router & Workstation)',
      service: 'woodworking',
      position: [-4.0, 0.9, 0.9],
      size: [1.6, 1.2, 1.4],
      rotationY: 0,
    },
    {
      id: 'laser-cutter',
      number: 3,
      label: 'Laser Cutting (Blue Elephant CO2)',
      service: 'laser-cutting',
      position: [1.2, 0.9, -3.1],
      size: [1.9, 0.9, 1.35],
      rotationY: 0,
    },
    {
      id: 'tools-cabinets',
      number: 4,
      label: 'Tools & Storage Racks',
      service: 'tooling-storage',
      position: [-4.5, 1.2, -1.8],
      size: [0.6, 2.1, 5.0],
      rotationY: 0,
    },
  ],
};
