// The studio explorer's view model.
/*
  AGENTS.md: nothing in components/studio imports from content/, types
  included. These are the shapes the Design Studio route maps its records onto,
  kept in their own file so StudioExplorer stays inside the 150-line rule.
*/

import type { ServiceId } from "./studioLayout";

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
  spaceName: string;
  /** true where the capability is held at the ATC, which the room model does not cover */
  atc: boolean;
  headline: string;
  body: string;
  modelGroup: ServiceId | null;
  pending: readonly string[];
  enquiry: string;
  enquiryHref: string;
  image: string;
  components: readonly ExplorerComponent[];
};
