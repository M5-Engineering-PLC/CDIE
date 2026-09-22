"use client";

// Enhancements 2026-09-22: "on mobile we just need one pill for 3d view and
// photographs". Phone only; wider screens keep the plan thumbnail and links.

export function StudioViewPill({ open, onOpen, onClose }: { open: boolean; onOpen: () => void; onClose: () => void }) {
  const options = [
    { label: "3D view", on: open, act: onOpen },
    { label: "Photographs", on: !open, act: onClose },
  ];
  return (
    <div role="group" aria-label="Studio view" className="inline-flex self-start rounded-full border border-line p-0.5 md:hidden">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={option.on}
          onClick={option.act}
          className={`rounded-full px-4 py-1.5 text-fine font-medium transition-colors ${option.on ? "bg-brand text-surface" : "text-ink-2 hover:text-brand"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
