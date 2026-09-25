"use client";

/* Source: user-supplied ATC floor plan and room videos. */

import { useRef, useState } from "react";

import type { AtcServiceId } from "./atcLayout";
import { useAtcScene, type AtcView } from "./useAtcScene";

export type Atc3DProps = {
  active?: AtcServiceId | null;
  onSelect?: (service: AtcServiceId) => void;
  className?: string;
  initialView?: AtcView;
  tour?: boolean;
  interactive?: boolean;
};

export function Atc3D({
  active = null,
  onSelect,
  className = "",
  initialView = "isometric",
  tour = false,
  interactive = true,
}: Atc3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<AtcView>(initialView);
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [roofVisible, setRoofVisible] = useState<boolean>(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const { toggleRoof } = useAtcScene({
    canvasRef,
    active,
    view,
    tour,
    interactive,
    showLabels,
    onSelect,
    onReady: () => setStatus("ready"),
    onError: () => setStatus("error"),
  });

  const handleRoofToggle = () => {
    if (toggleRoof) {
      const state = toggleRoof();
      if (typeof state === "boolean") {
        setRoofVisible(state);
      } else {
        setRoofVisible((prev) => !prev);
      }
    }
  };

  if (status === "error") {
    return (
      <div className={`grid aspect-video place-items-center border border-line bg-raise p-6 ${className}`}>
        <p className="max-w-[38ch] text-center text-body text-ink-2">
          The interactive ATC workshop view is unavailable. The surrounding page can continue
          to present the workshop services and photographs.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden border border-line bg-raise ${className}`}>
      <canvas
        ref={canvasRef}
        className={`block aspect-video min-h-96 w-full ${interactive ? "touch-none" : "touch-pan-y"}`}
        role="img"
        aria-label="Interactive illustrative 3D model of the CDIE ATC workshop, based on the supplied floor plan and room videos. Drag to orbit, scroll to zoom, or select equipment to highlight its capability."
      />

      {status === "loading" ? (
        <p className="pointer-events-none absolute inset-0 grid place-items-center bg-raise text-fine text-ink-3">
          Loading the workshop…
        </p>
      ) : null}

      {/* Floating Control Toolbar */}
      {interactive && !tour ? (
        <div
          className="absolute bottom-4 right-4 flex flex-wrap items-center gap-1 border border-line bg-surface p-1 shadow-sm"
          aria-label="ATC room view controls"
        >
          {(["isometric", "top"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={`px-3 py-1.5 text-fine transition-colors ${
                view === option ? "bg-brand text-surface" : "text-ink-2 hover:bg-raise"
              }`}
            >
              {option === "isometric" ? "Isometric" : "Top view"}
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-line" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setShowLabels((prev) => !prev)}
            aria-pressed={showLabels}
            className={`px-2.5 py-1.5 text-fine transition-colors ${
              showLabels ? "bg-raise font-medium text-ink" : "text-ink-3 hover:bg-raise"
            }`}
            title="Show or hide the station markers"
            disabled={status !== "ready"}
          >
            Station markers: {showLabels ? "On" : "Off"}
          </button>

          <button
            type="button"
            onClick={handleRoofToggle}
            aria-pressed={roofVisible}
            className={`px-2.5 py-1.5 text-fine transition-colors ${roofVisible ? "bg-raise font-medium text-ink" : "text-ink-2 hover:bg-raise"}`}
            title="Show or hide the corrugated roof panels"
            disabled={status !== "ready"}
          >
            Roof: {roofVisible ? "On" : "Off"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
