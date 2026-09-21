/*
  The compact ATC Workshop navigator, drawn from the vendored atcLayout module.
  Lightweight 2D stand-in for the Three.js model.
*/

import { atcLayout, type AtcServiceId } from "./atc-3js";

const SCALE = 38;
const PAD = 20;
const { width, depth } = atcLayout.room;
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

const rects = atcLayout.stations.map((st) => ({
  key: st.id,
  x: toX(st.position[0] - st.size[0] / 2),
  y: toY(st.position[2] - st.size[2] / 2),
  w: st.size[0] * SCALE,
  h: st.size[2] * SCALE,
  service: st.service,
  label: st.label,
  number: st.number,
}));

const gridLines = {
  vertical: Array.from({ length: Math.floor(width) + 1 }, (_, i) => -halfWidth + i),
  horizontal: Array.from({ length: Math.floor(depth) + 1 }, (_, i) => -halfDepth + i),
};

export function AtcRoomPlan({ active, className = "" }: AtcRoomPlanProps) {
  const contX = toX(-4.5 - 3.2 / 2);
  const contY = toY(-0.2 - 6.4 / 2);

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      role="img"
      aria-label="Plan of the CDIE ATC Prototyping Workshop, with selected area highlighted"
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
      <rect x={PAD} y={PAD} width={width * SCALE} height={depth * SCALE} fill="none" stroke="var(--color-ink-3)" strokeWidth={1.5} />
      <rect x={contX} y={contY} width={3.2 * SCALE} height={6.4 * SCALE} fill="rgba(29, 79, 141, 0.08)" stroke="rgba(29, 79, 141, 0.5)" strokeWidth={1.5} strokeDasharray="4 2" rx={3} />
      <text x={contX + 8} y={contY + 16} fontSize={8} fontFamily="var(--font-mono)" fill="var(--color-ink-3)" letterSpacing="0.05em">
        BLUE SHIPPING CONTAINER
      </text>
      <g stroke="var(--color-ink-3)" strokeWidth={1.2}>
        <line x1={toX(halfWidth)} y1={toY(-0.6)} x2={toX(halfWidth + 0.4)} y2={toY(-0.6)} />
        <line x1={toX(halfWidth)} y1={toY(1.6)} x2={toX(halfWidth + 0.4)} y2={toY(1.6)} />
        <text x={toX(halfWidth) - 6} y={toY(0.5)} textAnchor="end" fontSize={8} fontFamily="var(--font-mono)" fill="var(--color-ink-3)">
          ENTRANCE →
        </text>
      </g>
      {rects.map((rect) => {
        const on = active !== null && (rect.service === active || (active === "metalworking" && rect.service === "tooling-storage"));
        return (
          <g key={rect.key}>
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={2} fill={on ? "var(--color-brand-live)" : "var(--color-ink-3)"} opacity={on ? 0.95 : 0.28} />
            {rect.number ? (
              <g transform={`translate(${rect.x + rect.w / 2}, ${rect.y + rect.h / 2})`}>
                <circle r={8} fill={on ? "var(--color-surface)" : "var(--color-brand)"} />
                <text y={3} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fontWeight="bold" fill={on ? "var(--color-brand-live)" : "#ffffff"}>
                  {rect.number}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
