/* Source: user-supplied ATC plan, read counter-clockwise, and the supplied room videos. */

import { atcLayout, type AtcServiceId } from "./atc-3js";

const SCALE = 42;
const PAD = 34;
const { width, depth } = atcLayout.room;
const container = atcLayout.container;
const halfWidth = width / 2;
const halfDepth = depth / 2;
const toX = (x: number) => (x + halfWidth) * SCALE + PAD;
const toY = (z: number) => (z + halfDepth) * SCALE + PAD;
const viewWidth = width * SCALE + PAD * 2;
const viewHeight = depth * SCALE + PAD * 2;

export type AtcRoomPlanProps = {
  active: AtcServiceId | null;
  className?: string;
};

const rects = atcLayout.stations.map((station) => ({
  key: station.id,
  x: toX(station.position[0] - station.size[0] / 2),
  y: toY(station.position[2] - station.size[2] / 2),
  width: station.size[0] * SCALE,
  height: station.size[2] * SCALE,
  service: station.service,
  label: station.label,
  number: station.number,
}));

export function AtcRoomPlan({ active, className = "" }: AtcRoomPlanProps) {
  const storage = rects.find((station) => station.service === "tooling-storage");
  const stations = rects.filter((station) => station.service !== "tooling-storage");
  const grid = SCALE;

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      role="img"
      aria-label="Illustrative ATC workshop floor plan. The retained blue shipping-container tool shed contains two metalworking benches. Woodworking stations sit across the aisle, and the laser station sits at the far side. The room is not measured."
      className={`h-auto w-full border border-line bg-raise ${className}`}
    >
      <title>ATC workshop floor plan</title>
      <desc>Layout read from the hand-drawn plan and adjusted to match the room videos. Not to scale.</desc>
      <rect x="0" y="0" width={viewWidth} height={viewHeight} fill="var(--color-raise)" />
      <g stroke="var(--color-line)" strokeWidth={0.55} opacity={0.42}>
        {Array.from({ length: Math.floor(width) + 1 }, (_, index) => -halfWidth + index).map((x) => (
          <line key={`v-${x}`} x1={toX(x)} y1={toY(-halfDepth)} x2={toX(x)} y2={toY(halfDepth)} />
        ))}
        {Array.from({ length: Math.floor(depth) + 1 }, (_, index) => -halfDepth + index).map((z) => (
          <line key={`h-${z}`} x1={toX(-halfWidth)} y1={toY(z)} x2={toX(halfWidth)} y2={toY(z)} />
        ))}
      </g>

      <rect x={PAD} y={PAD} width={width * SCALE} height={depth * SCALE} fill="none" stroke="var(--color-ink-2)" strokeWidth={2.4} />
      <g stroke="var(--color-ink-3)" strokeWidth={3} opacity={0.75}>
        <line x1={toX(-halfWidth + 0.35)} y1={toY(-halfDepth)} x2={toX(halfWidth - 0.35)} y2={toY(-halfDepth)} />
        <line x1={toX(-halfWidth)} y1={toY(-halfDepth + 0.45)} x2={toX(-halfWidth)} y2={toY(halfDepth - 0.45)} />
        <line x1={toX(halfWidth)} y1={toY(-halfDepth + 0.45)} x2={toX(halfWidth)} y2={toY(halfDepth - 0.45)} />
      </g>
      <text x={PAD + 8} y={PAD - 12} fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-ink-3)" letterSpacing="0.08em">
        ILLUSTRATIVE LAYOUT · NOT TO SCALE
      </text>

      <g>
        <rect
          x={toX(container.position[0] - container.size[0] / 2)}
          y={toY(container.position[2] - container.size[2] / 2)}
          width={container.size[0] * SCALE}
          height={container.size[2] * SCALE}
          rx={3}
          fill="var(--color-brand)"
          fillOpacity={0.08}
          stroke="var(--color-brand)"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
        <text
          x={toX(container.position[0])}
          y={toY(container.position[2] - container.size[2] / 2 + 0.55)}
          textAnchor="middle"
          fontSize={8}
          fontFamily="var(--font-mono)"
          fill="var(--color-brand)"
          letterSpacing="0.04em"
        >
          BLUE CONTAINER TOOL SHED
        </text>
      </g>

      {storage ? (
        <g>
          <rect
            x={storage.x}
            y={storage.y}
            width={storage.width}
            height={storage.height}
            rx={2}
            fill={active === "tooling-storage" || active === "metalworking" ? "var(--color-brand-live)" : "var(--color-brand)"}
            opacity={active === "tooling-storage" || active === "metalworking" ? 0.72 : 0.15}
            stroke="var(--color-brand)"
            strokeWidth={1.5}
          />
          <text x={storage.x + storage.width / 2} y={storage.y + storage.height / 2 + 3} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-ink-2)">
            BLUE STORAGE BAYS + TOOL SHELVES
          </text>
        </g>
      ) : null}

      <text x={toX(0)} y={toY(0.55)} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--color-ink-3)" opacity={0.8}>
        CLEAR WORK AISLE
      </text>
      {stations.map((station) => {
        const selected = active !== null && (station.service === active || (active === "metalworking" && station.service === "tooling-storage"));
        const tone = station.service === "laser-cutting" ? "var(--color-brand-live)" : station.service === "woodworking" ? "var(--color-brand)" : "var(--color-ink-3)";
        const label = station.key === "metalworking-bench-a" ? "M.W. BENCH 1"
          : station.key === "metalworking-bench-b" ? "M.W. BENCH 2"
          : station.key === "woodworking-cnc" ? "W.W. CNC ROUTER"
          : station.key === "woodworking-assembly" ? "W.W. ASSEMBLY"
          : "LASER";
        const fill = selected ? "var(--color-brand-live)" : tone;
        return (
          <g key={station.key}>
            <rect x={station.x} y={station.y} width={station.width} height={station.height} rx={3} fill={fill} opacity={selected ? 0.9 : 0.24} stroke={fill} strokeWidth={selected ? 2.2 : 1.2} />
            <title>{station.label}</title>
            {station.number ? (
              <circle cx={station.x + 13} cy={station.y + 13} r={8} fill="var(--color-surface)" stroke={fill} strokeWidth={1.5} />
            ) : null}
            {station.number ? (
              <text x={station.x + 13} y={station.y + 16} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--color-ink)">
                {station.number}
              </text>
            ) : null}
            <text x={station.x + station.width / 2} y={station.y + station.height / 2 + 3} textAnchor="middle" fontSize={station.width < grid * 2.2 ? 7 : 8} fontFamily="var(--font-mono)" fill="var(--color-ink)">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
