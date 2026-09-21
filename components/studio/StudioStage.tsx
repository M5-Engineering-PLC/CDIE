"use client";

/*
  Lucid: Design Studio, virtual tour first. Concept 02: the plan opens into an
  interactive room.

  The stage holds one of three things now.

  - Closed: the flat plan over a photograph, which ships with the page and
    costs nothing. Three.js is around half a megabyte and is not in the page
    weight until a visitor asks for the room by opening it.
  - Open, on a capability the model places: the Three.js room, turning slowly
    while the tour runs and closing on whatever is highlighted, with the
    callout riding over it.
  - Open, on a capability held at the ATC: the ATC view. See AtcView for why
    the stage switches rather than lighting a bench that is in another
    building.

  Change request 2026-09-21, section 4. `viewOnly` is the mobile posture:
  autofocus and the slow turn, no orbit, no zoom, no pan, so a touch scrolls
  the page. It is the same interface, not a reduced one.
*/

import dynamic from "next/dynamic";
import Image from "next/image";

import { AtcView } from "./AtcView";
import { RoomPlan } from "./RoomPlan";
import { StudioCallout } from "./StudioCallout";
import type { ServiceId } from "./studioLayout";

const DesignStudio3D = dynamic(
  () => import("./design-studio-3js").then((mod) => mod.DesignStudio3D),
  {
    ssr: false,
    loading: () => (
      <div className="grid aspect-video place-items-center border border-line bg-raise md:min-h-96">
        <p className="text-fine text-ink-3">Loading the room…</p>
      </div>
    ),
  },
);

export type StudioStageProps = {
  active: ServiceId | null;
  open: boolean;
  tour: boolean;
  viewOnly: boolean;
  atc: boolean;
  name: string;
  spaceName: string;
  headline: string;
  step: number;
  of: number;
  onSelect: (service: ServiceId) => void;
  onClose: () => void;
  onOpen: () => void;
  onToggleTour: () => void;
  image: string;
  imageAlt: string;
};

export function StudioStage({
  active,
  open,
  tour,
  viewOnly,
  atc,
  name,
  spaceName,
  headline,
  step,
  of,
  image,
  imageAlt,
  onSelect,
  onClose,
  onOpen,
  onToggleTour,
}: StudioStageProps) {
  if (!open) {
    return (
      <div className="relative min-h-48 overflow-hidden bg-ink md:min-h-[28rem]">
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 1280px) 100vw, 70vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
        <button type="button" onClick={onOpen} className="absolute bottom-4 left-4 w-36 border border-surface/50 bg-surface p-2 text-left shadow-lg transition hover:border-brand-live md:w-44">
          <RoomPlan active={active} className="w-full" />
          <span className="mt-2 flex items-center justify-between text-fine font-medium text-brand">Expand 3D tour</span>
        </button>
      </div>
    );
  }

  if (atc) {
    return <AtcView name={name} spaceName={spaceName} image={image} imageAlt={imageAlt} />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="relative">
        <DesignStudio3D active={active} onSelect={onSelect} tour={tour} interactive={!viewOnly} />
        <StudioCallout show={tour} name={name} spaceName={spaceName} headline={headline} step={step} of={of} />
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="max-w-[52ch] text-fine text-ink-3">
          {viewOnly
            ? "The room turns on its own and moves to whichever capability you choose. Illustrative and unmeasured."
            : "Drag to orbit, scroll to zoom, select a bench to jump to its capability. Illustrative and unmeasured."}
        </p>
        <div className="flex gap-4">
          <button type="button" onClick={onToggleTour} className="text-fine font-medium text-brand underline-offset-4 hover:underline">
            {tour ? "Pause the tour" : "Resume the tour"}
          </button>
          <button type="button" onClick={onClose} className="text-fine font-medium text-brand underline-offset-4 hover:underline">
            Minimise 3D tour
          </button>
        </div>
      </div>
    </div>
  );
}
