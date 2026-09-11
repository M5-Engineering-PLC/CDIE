"use client";

/*
  Lucid: Design Studio, virtual tour first. Concept 02: the plan opens into an
  interactive room.

  The stage holds one of two things. Closed, it is the flat plan, which ships
  with the page and costs nothing. Open, it is the Three.js room from
  components/studio/design-studio-3js, loaded on demand.

  Three.js is around half a megabyte. The brief asks for the mobile experience
  to be simplified exceptionally, so it is not in the page weight until a
  visitor asks for it by opening the room.
*/

import dynamic from "next/dynamic";
import Image from "next/image";

import { RoomPlan } from "./RoomPlan";
import type { ServiceId } from "./studioLayout";

const DesignStudio3D = dynamic(
  () => import("./design-studio-3js").then((mod) => mod.DesignStudio3D),
  {
    ssr: false,
    loading: () => (
      <div className="grid aspect-video min-h-96 place-items-center border border-line bg-raise">
        <p className="text-fine text-ink-3">Loading the room…</p>
      </div>
    ),
  },
);

export type StudioStageProps = {
  active: ServiceId | null;
  open: boolean;
  onSelect: (service: ServiceId) => void;
  onClose: () => void;
  onOpen: () => void;
  image: string;
  imageAlt: string;
};

export function StudioStage({ active, open, image, imageAlt, onSelect, onClose, onOpen }: StudioStageProps) {
  if (!open) {
    return (
      <div className="relative min-h-[28rem] overflow-hidden bg-ink">
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 1280px) 100vw, 70vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
        <button type="button" onClick={onOpen} className="absolute bottom-4 left-4 w-44 border border-surface/50 bg-surface p-2 text-left shadow-lg transition hover:border-brand-live">
          <RoomPlan active={active} className="w-full" />
          <span className="mt-2 flex items-center justify-between text-fine font-medium text-brand">Expand 3D tour <span aria-hidden="true">↗</span></span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DesignStudio3D active={active} onSelect={onSelect} />
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="max-w-[52ch] text-fine text-ink-3">
          Drag to orbit, scroll to zoom, select a bench to jump to its capability.
          Illustrative and unmeasured.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-fine font-medium text-brand underline-offset-4 hover:underline"
        >
          Minimise 3D tour
        </button>
      </div>
    </div>
  );
}
