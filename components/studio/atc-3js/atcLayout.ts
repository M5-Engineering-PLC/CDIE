export type Vec3Tuple = readonly [number, number, number];

export type AtcServiceId =
  | "woodworking"
  | "tooling-storage"
  | "laser-cutting"
  | "metalworking"
  | "facility-access";

export type AtcStationLayout = {
  id: string;
  number?: 1 | 2 | 3 | 4;
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
  "metalworking",
  "woodworking",
  "laser-cutting",
  "tooling-storage",
] as const;

export const atcLayout: AtcLayout = {
  room: { width: 12.8, depth: 8.8, height: 2.8 },
  container: { position: [-4.4, 0, -0.2], size: [3.4, 2.5, 6.4] },
  isMeasured: false,
  stations: [
    {
      id: "metalworking",
      number: 1,
      label: "Metalworking (Workbenches & Tooling)",
      service: "metalworking",
      position: [1.2, 0.88, 1.4],
      size: [3.8, 0.9, 3.2],
      rotationY: 0,
    },
    {
      id: "woodworking",
      number: 2,
      label: "Woodworking (CNC Router & Workstation)",
      service: "woodworking",
      position: [-4.0, 0.88, 0.8],
      size: [2.2, 1.4, 2.8],
      rotationY: 0,
    },
    {
      id: "laser-cutting",
      number: 3,
      label: "Laser Cutting (Blue Elephant CO2)",
      service: "laser-cutting",
      position: [2.2, 0.88, -2.9],
      size: [2.2, 1.1, 1.5],
      rotationY: 0,
    },
    {
      id: "tooling-storage",
      number: 4,
      label: "Tools & Storage Racks",
      service: "tooling-storage",
      position: [-4.8, 1.2, -0.6],
      size: [0.6, 2.2, 5.0],
      rotationY: 0,
    },
  ],
};
