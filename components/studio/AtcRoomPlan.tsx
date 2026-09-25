/* Source: User-supplied ATC floor plan and site photos. */

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
  const containerX = toX(container.position[0] - container.size[0] / 2);
  const containerY = toY(container.position[2] - container.size[2] / 2);
  const containerW = container.size[0] * SCALE;
  const containerH = container.size[2] * SCALE;

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      role="img"
      aria-label="Floor plan of the CDIE ATC Engineering & Prototyping Workshop"
      className={`h-auto w-full border border-line bg-raise ${className}`}
    >
      <title>ATC workshop floor plan</title>
      <rect x="0" y="0" width={viewWidth} height={viewHeight} fill="var(--color-raise)" />

      {/* Grid lines */}
      <g stroke="var(--color-line)" strokeWidth={0.5} opacity={0.35}>
        {Array.from({ length: Math.floor(width) + 1 }, (_, i) => -halfWidth + i).map((x) => (
          <line key={`v-${x}`} x1={toX(x)} y1={toY(-halfDepth)} x2={toX(x)} y2={toY(halfDepth)} />
        ))}
        {Array.from({ length: Math.floor(depth) + 1 }, (_, i) => -halfDepth + i).map((z) => (
          <line key={`h-${z}`} x1={toX(-halfWidth)} y1={toY(z)} x2={toX(halfWidth)} y2={toY(z)} />
        ))}
      </g>

      {/* Room boundary walls */}
      <rect x={PAD} y={PAD} width={width * SCALE} height={depth * SCALE} fill="none" stroke="var(--color-ink-2)" strokeWidth={2.4} />

      {/* Entrance label on right wall */}
      <g stroke="var(--color-ink-3)" strokeWidth={1.2}>
        <line x1={toX(halfWidth)} y1={toY(-0.6)} x2={toX(halfWidth + 0.4)} y2={toY(-0.6)} />
        <line x1={toX(halfWidth)} y1={toY(1.4)} x2={toX(halfWidth + 0.4)} y2={toY(1.4)} />
        <text x={toX(halfWidth) - 8} y={toY(0.4)} textAnchor="end" fontSize={8} fontFamily="var(--font-mono)" fill="var(--color-ink-3)">
          ENTRANCE →
        </text>
      </g>

      {/* Blue Container Outline */}
      <rect
        x={containerX}
        y={containerY}
        width={containerW}
        height={containerH}
        rx={3}
        fill="rgba(29, 79, 141, 0.08)"
        stroke="var(--color-brand)"
        strokeWidth={1.8}
        strokeDasharray="6 4"
      />
      <text
        x={containerX + 10}
        y={containerY + 16}
        fontSize={8}
        fontFamily="var(--font-mono)"
        fill="var(--color-brand)"
        letterSpacing="0.05em"
      >
        BLUE SHIPPING CONTAINER
      </text>

      {/* Stations */}
      {rects.map((station) => {
        const isSelected = active !== null && (station.service === active || (active === "metalworking" && station.service === "tooling-storage"));
        const tone = station.service === "laser-cutting" ? "var(--color-brand-live)" : station.service === "woodworking" ? "var(--color-brand)" : "var(--color-ink-3)";
        const fill = isSelected ? "var(--color-brand-live)" : tone;

        const shortLabel =
          station.service === "metalworking" ? "FABRICATION WORKBENCHES"
          : station.service === "woodworking" ? "CNC ROUTER & WORKSTATION"
          : station.service === "laser-cutting" ? "LASER CUTTER"
          : "TOOL STORAGE RACKS";

        return (
          <g key={station.key}>
            <rect
              x={station.x}
              y={station.y}
              width={station.width}
              height={station.height}
              rx={3}
              fill={fill}
              opacity={isSelected ? 0.92 : 0.26}
              stroke={fill}
              strokeWidth={isSelected ? 2 : 1}
            />
            {station.number ? (
              <g transform={`translate(${station.x + 16}, ${station.y + 16})`}>
                <circle r={8} fill={isSelected ? "var(--color-surface)" : "var(--color-brand)"} />
                <text y={3} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fontWeight="bold" fill={isSelected ? "var(--color-brand-live)" : "#ffffff"}>
                  {station.number}
                </text>
              </g>
            ) : null}
            <text
              x={station.x + station.width / 2}
              y={station.y + station.height / 2 + 3}
              textAnchor="middle"
              fontSize={station.width < 90 ? 7 : 8}
              fontFamily="var(--font-mono)"
              fill="var(--color-ink)"
              fontWeight={isSelected ? "bold" : "normal"}
            >
              {shortLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
