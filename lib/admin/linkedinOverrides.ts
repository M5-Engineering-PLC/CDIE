/* Fix plan 2026-10-11, W3: overrides stay in the sheet across LinkedIn syncs. */

import { unstable_cache } from "next/cache";

import { latestOverrides, type LinkedInOverride } from "@/lib/linkedin/placement.mjs";

import { appendRow, readTab, sheetsConfigured } from "./sheets";
import { CMS_TAG } from "./store";

export type { LinkedInOverride };

/* Fix plan 2026-10-11, W3: uncached Google requests stay inside the data cache. */
const readOverrides = unstable_cache(async () => latestOverrides(await readTab("linkedin", { revalidate: 0 })),
  ["linkedin-overrides"], { tags: [CMS_TAG], revalidate: 300 });

export async function linkedinOverrides(): Promise<LinkedInOverride[]> {
  if (!sheetsConfigured()) return [];
  /* A sheet outage must not take a public page down: fall back to automatic placement. */
  try {
    return await readOverrides();
  } catch (error) {
    console.error("[admin] LinkedIn overrides read failed, using automatic placement", error);
    return [];
  }
}

export async function saveLinkedinOverride(override: LinkedInOverride): Promise<void> {
  if (!sheetsConfigured()) throw new Error("Google Sheet is not configured.");
  const [valid] = latestOverrides([override]);
  if (!valid) throw new Error("The LinkedIn override is invalid.");
  await appendRow("linkedin", { ...valid });
}
