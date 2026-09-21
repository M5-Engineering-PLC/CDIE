"use client";

// Lucid: Design Studio > Virtual Tour. Copy: DESIGN STUDIO > Virtual tour.

import { useRef, useState } from "react";

import type { ServiceId } from "./studioLayout";
import { useDesignStudioScene, type StudioView } from "./useDesignStudioScene";

export type DesignStudio3DProps = {
  active?: ServiceId | null;
  onSelect?: (service: ServiceId) => void;
  className?: string;
  initialView?: StudioView;
  /** the camera drives itself: slow constant yaw, closing on what is highlighted */
  tour?: boolean;
  /*
    Change request 2026-09-21, section 4, mobile: "only autofocus capabilities,
    no scrolling, implement a view only mechanism of the same interface as
    desktop". False removes orbit, zoom, pan and the view buttons, and lets a
    touch on the canvas scroll the page. The room, the highlight and the
    autofocus are identical to the desktop tour.
  */
  interactive?: boolean;
};

export function DesignStudio3D({
  active = null,
  onSelect,
  className = "",
  initialView = "isometric",
  tour = false,
  interactive = true,
}: DesignStudio3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<StudioView>(initialView);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useDesignStudioScene({
    canvasRef,
    active,
    view,
    tour,
    interactive,
    onSelect,
    onReady: () => setStatus("ready"),
    onError: () => setStatus("error"),
  });

  if (status === "error") {
    return (
      <div className={`grid aspect-video place-items-center border border-line bg-raise p-6 ${className}`}>
        <p className="max-w-[38ch] text-center text-body text-ink-2">
          The interactive studio view is unavailable. The surrounding page can continue
          to present the studio services and photographs.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden border border-line bg-raise ${className}`}>
      <canvas
        ref={canvasRef}
        className={`block aspect-video w-full md:min-h-96 ${interactive ? "touch-none" : "touch-pan-y"}`}
        role="img"
        aria-label={
          interactive
            ? "Interactive three-dimensional plan of the CDIE Design Studio. Drag to orbit, scroll to zoom, or select equipment to highlight its service."
            : "Three-dimensional plan of the CDIE Design Studio. It turns on its own and moves to whichever capability is selected."
        }
      />

      {status === "loading" ? (
        <p className="pointer-events-none absolute inset-0 grid place-items-center bg-raise text-fine text-ink-3">
          Loading the studio…
        </p>
      ) : null}

      {interactive && !tour ? (
      <div className="absolute bottom-4 right-4 flex border border-line bg-surface p-1 shadow-sm" aria-label="Studio camera controls">
        {(["isometric", "top"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setView(option)}
            aria-pressed={view === option}
            className={`px-3 py-2 text-fine transition-colors ${
              view === option ? "bg-brand text-surface" : "text-ink-2 hover:bg-raise"
            }`}
          >
            {option === "isometric" ? "Isometric" : "Top view"}
          </button>
        ))}
      </div>
      ) : null}
    </div>
  );
}
