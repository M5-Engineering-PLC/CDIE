/*
  Vendored from the CDIE Design Studio Three.js prototype,
  Codex session 01a08a9e-a00c-7d50-bf0a-8c13823b6f36, src/studioLayout.ts.
  Copied unchanged so the website and the prototype cannot drift.

  The room is illustrative and unmeasured: normalised to 10.8 x 7.4 x 3.2
  from a hand sketch, room photographs, and IMG_0926.MOV. isMeasured stays false
  until a measured plan exists.
*/

export type Vec3Tuple = readonly [number, number, number];

export type ServiceId =
  | 'design'
  | 'co-working'
  | 'three-d-printing'
  | 'electronics'
  | 'textiles'
  /* 2026-09-24: shares the 3D printing rack, on its lowest shelf. */
  | 'casting-moulding';

export type TableLayout = {
  id: string;
  number: 1 | 2 | 3 | 4;
  x: number;
  z: number;
  rotation: number;
  width: number;
  depth: number;
};

export type StationLayout = {
  id: string;
  label: string;
  service: ServiceId;
  position: Vec3Tuple;
  size: Vec3Tuple;
  rotationY: number;
};

export type StudioLayout = {
  room: { width: number; depth: number; height: number };
  isMeasured: boolean;
  tables: readonly TableLayout[];
  stations: readonly StationLayout[];
};

export const requiredStationIds = [
  'door',
  'computer-stations',
  '3d-printer-station',
  'electronics-cupboards',
  'teacher-station',
  'tv',
  'whiteboard',
  'air-conditioner',
  'window-run',
  'electronics-window',
  'textile-stations',
] as const;

export const studioLayout: StudioLayout = {
  room: { width: 10.8, depth: 7.4, height: 3.2 },
  isMeasured: false,
  tables: [
    { id: 'table-3', number: 3, x: -1.65, z: -1.25, rotation: 0, width: 2.25, depth: 0.92 },
    { id: 'table-1', number: 1, x: 1.45, z: -1.25, rotation: 0, width: 2.25, depth: 0.92 },
    { id: 'table-4', number: 4, x: -1.65, z: 1.28, rotation: 0, width: 2.25, depth: 0.92 },
    { id: 'table-2', number: 2, x: 1.45, z: 1.28, rotation: 0, width: 2.25, depth: 0.92 },
  ],
  stations: [
    {
      id: 'door',
      label: 'Entry',
      service: 'design',
      position: [-5.32, 1.1, -2.9],
      size: [0.1, 2.2, 1.05],
      rotationY: Math.PI / 2,
    },
    {
      id: 'computer-stations',
      label: 'Computers',
      service: 'design',
      position: [-2.45, 0.55, -3.12],
      size: [3.05, 1.1, 0.78],
      rotationY: 0,
    },
    {
      id: '3d-printer-station',
      label: '3D printing',
      service: 'three-d-printing',
      position: [2.05, 0.72, -3.1],
      size: [3.2, 2.82, 0.82],
      rotationY: 0,
    },
    {
      id: 'casting-moulding-shelf',
      label: 'Casting and moulding',
      service: 'casting-moulding',
      /* 2026-09-25: the rack's bottom, floor-level shelf. */
      position: [2.05, 0.16, -3.1],
      size: [3.2, 0.1, 0.82],
      rotationY: 0,
    },
    {
      id: 'electronics-cupboards',
      label: 'Electronics cupboards',
      service: 'electronics',
      position: [4.96, 0.52, 0.35],
      size: [0.78, 1.04, 5.15],
      rotationY: 0,
    },
    {
      id: 'textile-stations',
      label: 'Textile sewing stations',
      service: 'textiles',
      position: [-4.85, 0.75, 0.775],
      size: [0.8, 1.5, 3.1],
      rotationY: Math.PI / 2,
    },
    {
      id: 'teacher-station',
      label: 'Teacher station',
      service: 'design',
      position: [-4.0, 0.57, 3.02],
      size: [2.0, 1.14, 0.84],
      rotationY: 0,
    },
    {
      id: 'tv',
      label: 'Display',
      service: 'design',
      position: [-1.45, 1.55, 3.58],
      size: [1.25, 0.75, 0.08],
      rotationY: 0,
    },
    {
      id: 'whiteboard',
      label: 'Whiteboard',
      service: 'design',
      position: [1.45, 1.62, 3.57],
      size: [2.15, 1.05, 0.08],
      rotationY: 0,
    },
    {
      id: 'air-conditioner',
      label: 'Air conditioner',
      service: 'design',
      position: [1.45, 2.56, 3.47],
      size: [1.2, 0.32, 0.3],
      rotationY: 0,
    },
    {
      id: 'window-run',
      label: 'High windows',
      service: 'co-working',
      position: [-5.33, 2.12, 0.15],
      size: [0.08, 0.92, 4.35],
      rotationY: Math.PI / 2,
    },
    {
      id: 'electronics-window',
      label: 'Electronics window',
      service: 'electronics',
      position: [5.32, 2.05, 0],
      size: [0.08, 1.36, 4.9],
      rotationY: Math.PI / 2,
    },
  ],
};

export function validateLayout(layout: StudioLayout): string[] {
  const errors: string[] = [];
  const halfWidth = layout.room.width / 2;
  const halfDepth = layout.room.depth / 2;

  for (const table of layout.tables) {
    if (Math.abs(table.x) + table.width / 2 > halfWidth) errors.push(`${table.id} exceeds room width`);
    if (Math.abs(table.z) + table.depth / 2 > halfDepth) errors.push(`${table.id} exceeds room depth`);
  }

  for (const station of layout.stations) {
    const [x, , z] = station.position;
    const [width, , depth] = station.size;
    if (Math.abs(x) + width / 2 > halfWidth + 0.05) errors.push(`${station.id} exceeds room width`);
    if (Math.abs(z) + depth / 2 > halfDepth + 0.05) errors.push(`${station.id} exceeds room depth`);
  }

  return errors;
}
