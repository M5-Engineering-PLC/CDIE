"use client";

// Enhancements 2026-09-22: every carousel rotates slowly, with no pause control.
// A drop-in <ul> for rails that are otherwise pure CSS, so server components can
// keep rendering their cards and still get the rotation.

import { Children, useRef, type ReactNode } from "react";

import { useRailRotation } from "@/lib/useRailRotation";

import { RailDots } from "./RailDots";

export function AutoRail({
  className,
  label,
  children,
}: {
  className: string;
  label?: string;
  children: ReactNode;
}) {
  const rail = useRef<HTMLUListElement>(null);
  useRailRotation(rail);

  return (
    <div>
      <ul ref={rail} aria-label={label} className={`${className} rail-glide`}>
        {children}
      </ul>
      <RailDots rail={rail} count={Children.count(children)} label={label ?? "cards"} />
    </div>
  );
}
