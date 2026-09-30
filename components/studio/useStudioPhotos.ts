"use client";

// Review 2026-09-30: the photograph on the studio stage, and warming the large photographs ahead of use.
/*
  useStagePhoto keeps which of a capability's photographs is on the stage. The
  choice is stored with the capability it was made for, so choosing another
  capability shows that one's lead photograph with no effect to reset it.

  useStudioPhotoWarmup: "preload the 3D views and large images to reduce load
  time". Once the page is idle it fetches, at the size the stage will ask for,
  the lead photograph of every capability and every photograph of the one
  selected, so switching capability or thumbnail paints from the cache. The
  URLs come from getImageProps with the stage's own sizes, so the browser picks
  the same srcset candidate it will later render. Skipped under Save-Data.
*/

import { getImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";

/** The `sizes` the stage's photograph is rendered with (StudioStage). */
export const STAGE_SIZES = "(max-width: 1280px) 100vw, 70vw";

type Photo = { src: string };

export function useStagePhoto(capabilityId: string) {
  const [choice, setChoice] = useState({ id: capabilityId, index: 0 });
  const index = choice.id === capabilityId ? choice.index : 0;
  const pick = (next: number) => setChoice({ id: capabilityId, index: next });
  return [index, pick] as const;
}

const warmed = new Set<string>();

function warm(src: string) {
  if (warmed.has(src)) return;
  warmed.add(src);
  const { props } = getImageProps({ src, alt: "", fill: true, sizes: STAGE_SIZES });
  const image = new window.Image();
  image.decoding = "async";
  if (props.sizes) image.sizes = props.sizes;
  if (props.srcSet) image.srcset = props.srcSet;
  image.src = props.src;
}

const NONE: readonly Photo[] = [];

export function useStudioPhotoWarmup(capabilities: readonly { media: readonly Photo[] }[], selected: readonly Photo[] = NONE) {
  const leads = useMemo(() => capabilities.flatMap((item) => item.media.slice(0, 1)), [capabilities]);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const idle = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const run = () => [...selected, ...leads].forEach((photo) => warm(photo.src));
    if (idle.requestIdleCallback) {
      const id = idle.requestIdleCallback(run, { timeout: 1500 });
      return () => idle.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(run, 400);
    return () => window.clearTimeout(id);
  }, [leads, selected]);
}
