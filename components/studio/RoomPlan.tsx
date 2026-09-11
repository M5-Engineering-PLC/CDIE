/*
  The compact room navigator, drawn from the vendored layout module.

  This is the 2D stand-in for the Three.js model. It reads the same
  coordinates, so a capability lights up here exactly where it lights up in the
  room, and it costs the visitor no download. Gate 5 of the build plan swaps
  the drawing for createDesignStudioModel() behind this same interface: the
  component takes a service group id and emits one.

  Nothing in components/studio imports from content/.
*/

import { studioLayout, type ServiceId } from "./studioLayout";

const SCALE = 42;
const PAD = 16;
const { width, depth } = studioLayout.room;
const halfWidth = width / 2;
const halfDepth = depth / 2;

const toX = (x: number) => (x + halfWidth) * SCALE + PAD;
const toY = (z: number) => (z + halfDepth) * SCALE + PAD;

const viewWidth = width * SCALE + PAD * 2;
const viewHeight = depth * SCALE + PAD * 2;

export type RoomPlanProps = {
  /** the highlighted service group, or null when the capability has no position here */
  active: ServiceId | null;
  className?: string;
};

type Rect = { key: string; x: number; y: number; w: number; h: number; service: ServiceId };

function buildRects(): Rect[] {
  const tables: Rect[] = studioLayout.tables.map((table) => ({
    key: table.id,
    x: toX(table.x - table.width / 2),
    y: toY(table.z - table.depth / 2),
    w: table.width * SCALE,
    h: table.depth * SCALE,
    service: "co-working",
  }));

  const stations: Rect[] = studioLayout.stations.map((station) => {
    const [x, , z] = station.position;
    const [w, , d] = station.size;
    return {
      key: station.id,
      x: toX(x - w / 2),
      y: toY(z - d / 2),
      w: w * SCALE,
      h: d * SCALE,
      service: station.service,
    };
  });

  return [...tables, ...stations];
}

const rects = buildRects();

const gridLines = (() => {
  const vertical: number[] = [];
  const horizontal: number[] = [];
  for (let x = -halfWidth; x <= halfWidth + 0.01; x += 0.9) vertical.push(x);
  for (let z = -halfDepth; z <= halfDepth + 0.01; z += 0.9) horizontal.push(z);
  return { vertical, horizontal };
})();

export function RoomPlan({ active, className = "" }: RoomPlanProps) {
  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      role="img"
      aria-label="Plan of the CDIE design studio, with the selected area highlighted"
      className={`h-auto w-full border border-line bg-raise ${className}`}
    >
      <g stroke="var(--color-line)" strokeWidth={0.6}>
        {gridLines.vertical.map((x) => (
          <line key={`v${x}`} x1={toX(x)} y1={toY(-halfDepth)} x2={toX(x)} y2={toY(halfDepth)} />
        ))}
        {gridLines.horizontal.map((z) => (
          <line key={`h${z}`} x1={toX(-halfWidth)} y1={toY(z)} x2={toX(halfWidth)} y2={toY(z)} />
        ))}
      </g>

      <rect
        x={PAD}
        y={PAD}
        width={width * SCALE}
        height={depth * SCALE}
        fill="none"
        stroke="var(--color-ink-3)"
        strokeWidth={1.5}
      />

      {rects.map((rect) => {
        const on = active !== null && rect.service === active;
        return (
          <rect
            key={rect.key}
            x={rect.x}
            y={rect.y}
            width={rect.w}
            height={rect.h}
            rx={1.5}
            fill={on ? "var(--color-brand-live)" : "var(--color-ink-3)"}
            opacity={on ? 1 : 0.32}
          />
        );
      })}

      {studioLayout.tables.map((table) => (
        <text
          key={`${table.id}-n`}
          x={toX(table.x)}
          y={toY(table.z) + 3.5}
          textAnchor="middle"
          fontSize={9}
          fontFamily="var(--font-mono)"
          fill="var(--color-surface)"
        >
          {table.number}
        </text>
      ))}
    </svg>
  );
}
