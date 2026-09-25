// The studio explorer's view model.
/*
  AGENTS.md: nothing in components/studio imports from content/, types
  included. These are the shapes the Design Studio route maps its records onto,
  kept in their own file so StudioExplorer stays inside the 150-line rule.
*/

import type { AtcServiceId } from "./atc-3js";
import type { ServiceId } from "./studioLayout";

export type UnifiedServiceId = ServiceId | AtcServiceId;

/** One bench, station or tool inside a capability. See StudioComponentGrid. */
export type ExplorerComponent = {
  id: string;
  name: string;
  note: string;
  /** the component's own photograph, once CDIE has taken it */
  image?: string;
  /** what is visible in the frame, never what the picture stands for */
  alt?: string;
};

export type ExplorerCapability = {
  id: string;
  name: string;
  space: "studio" | "atc";
  spaceName: string;
  /** true where the capability is held at the ATC */
  atc: boolean;
  headline: string;
  body: string;
  modelGroup: UnifiedServiceId | null;
  pending: readonly string[];
  enquiry: string;
  enquiryHref: string;
  image: string;
  /** every photograph of the area, the first of them on the stage */
  media: readonly { src: string; alt: string }[];
  components: readonly ExplorerComponent[];
};
