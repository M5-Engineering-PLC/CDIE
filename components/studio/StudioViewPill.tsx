"use client";

// Enhancements 2026-09-22: "on mobile we just need one pill for 3d view and
// photographs". Later the same day: "replicate the mobile design studio pill
// on desktop as well", so it is the one view switch at every width.
// Adds the sliding indicator from adds.txt's Transitions.dev tab reference.

import { useEffect, useRef } from "react";

export function StudioViewPill({ open, onOpen, onClose }: { open: boolean; onOpen: () => void; onClose: () => void }) {
  const pill = useRef<HTMLSpanElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const move = () => {
      const button = buttons.current[open ? 0 : 1];
      if (!button || !pill.current) return;
      pill.current.style.transform = `translateX(${button.offsetLeft}px)`;
      pill.current.style.width = `${button.offsetWidth}px`;
    };
    move();
    const observer = new ResizeObserver(move);
    buttons.current.forEach((button) => { if (button) observer.observe(button); });
    return () => observer.disconnect();
  }, [open]);
  const options = [
    { label: "3D view", on: open, act: onOpen },
    { label: "Photographs", on: !open, act: onClose },
  ];
  return (
    <div role="group" aria-label="Studio view" className="sliding-toggle inline-flex self-start rounded-full border border-line p-0.5">
      <span ref={pill} className="sliding-toggle-indicator" aria-hidden="true" />
      {options.map((option, index) => (
        <button
          key={option.label}
          ref={(node) => { buttons.current[index] = node; }}
          type="button"
          aria-pressed={option.on}
          onClick={option.act}
          className={`sliding-toggle-button rounded-full px-4 py-1.5 text-fine font-medium transition-colors ${option.on ? "text-surface" : "text-ink-2 hover:text-brand"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
