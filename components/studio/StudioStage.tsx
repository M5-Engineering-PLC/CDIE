"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

import { StudioCallout } from "./StudioCallout";
import { StudioSpaceToggle } from "./StudioSpaceToggle";
import { StudioViewPill } from "./StudioViewPill";
import type { AtcServiceId } from "./atc-3js";
import type { UnifiedServiceId } from "./explorerModel";
import type { ServiceId } from "./studioLayout";
import { preloadAtc3D, preloadDesignStudio3D } from "./preloadStudio3D";
import { STAGE_SIZES } from "./useStudioPhotos";

const LoadingBox = ({ text }: { text: string }) => (
  <div className="grid aspect-video place-items-center border border-line bg-raise md:min-h-96">
    <p className="text-fine text-ink-3">{text}</p>
  </div>
);

const DesignStudio3D = dynamic(
  () => preloadDesignStudio3D().then((mod) => mod.DesignStudio3D),
  { ssr: false, loading: () => <LoadingBox text="Loading the room…" /> },
);

const Atc3D = dynamic(
  () => preloadAtc3D().then((mod) => mod.Atc3D),
  { ssr: false, loading: () => <LoadingBox text="Loading the ATC workshop…" /> },
);

export type StudioStageProps = {
  active: UnifiedServiceId | null;
  open: boolean;
  tour: boolean;
  viewOnly: boolean;
  atc: boolean;
  space?: "studio" | "atc";
  name: string;
  spaceName: string;
  headline: string;
  step: number;
  of: number;
  image: string;
  imageAlt: string;
  /** the cover's own size: the frame takes its shape so the whole photograph shows */
  imageSize?: { width: number; height: number };
  onSelect: (service: UnifiedServiceId) => void;
  onClose: () => void;
  onOpen: () => void;
  onSwitchSpace?: (space: "studio" | "atc") => void;
  /** build both scenes in the background before the room is opened */
  warm?: boolean;
};

export function StudioStage({
  active, open, tour, viewOnly, atc, space, name, spaceName, headline,
  step, of, image, imageAlt, imageSize, onSelect, onClose, onOpen, onSwitchSpace, warm = false,
}: StudioStageProps) {
  const isAtc = space === "atc" || atc;

  const toggleBar = onSwitchSpace ? <StudioSpaceToggle isAtc={isAtc} onSwitch={onSwitchSpace} /> : null;

  const viewPill = <StudioViewPill open={open} onOpen={onOpen} onClose={onClose} />;

  /*
    Both scenes stay mounted once built and the hidden one stops drawing.
    Switching spaces used to unmount one and rebuild the other from nothing:
    renderer, model, shadow maps and shaders. Now it only shows a canvas.
  */
  const scenes = open || warm ? (
    <div className={open ? "relative" : "hidden"} aria-hidden={!open || undefined}>
      <div className={isAtc ? undefined : "hidden"}>
        <Atc3D active={isAtc ? (active as AtcServiceId | null) : null} onSelect={(s) => onSelect(s)} tour={tour && isAtc} interactive={!viewOnly} paused={!open || !isAtc} />
      </div>
      <div className={isAtc ? "hidden" : undefined}>
        <DesignStudio3D
          active={isAtc ? null : (active as ServiceId | null)}
          onSelect={(s) => onSelect(s)}
          initialView={name === "Textiles and upholstery" ? "textile" : "isometric"}
          tour={tour && !isAtc}
          interactive={!viewOnly}
          paused={!open || isAtc}
        />
      </div>
      {open ? <StudioCallout show={tour || isAtc} name={name} spaceName={spaceName} headline={headline} step={step} of={of} /> : null}
    </div>
  ) : null;

  if (!open) {
    return (
      <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:flex-1">
        {toggleBar}
        {viewPill}
        {scenes}
        {/* Follow-up 2026-09-25: the frame follows the photograph's own ratio
            and the image is contained, never cropped. */}
        <div
          className="relative max-h-[28rem] min-h-48 overflow-hidden bg-ink lg:max-h-none lg:min-h-72 lg:flex-1 lg:!aspect-auto"
          style={imageSize ? { aspectRatio: `${imageSize.width} / ${imageSize.height}` } : undefined}
        >
          {/* Review 2026-09-30: "the main image should be a bit smaller"; the
              thumbnails under the stage (StudioPhotoStrip) choose it, and the
              new one settles in rather than cutting. */}
          <Image key={image} src={image} alt={imageAlt} fill sizes={STAGE_SIZES} loading="eager" className="settle object-contain" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
          {/* Enhancements 2026-09-22: "remove the expand button". The pill above is the switch. */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {toggleBar}
      {viewPill}
      {scenes}
    </div>
  );
}
