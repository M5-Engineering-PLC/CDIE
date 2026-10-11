/* Fix plan 2026-10-11, W3: one guarded action saves each post's placement and date. */
"use server";

import { revalidatePath, updateTag } from "next/cache";

import snapshot from "@/content/linkedin-snapshot.json";
import { requireAdmin } from "@/lib/admin/auth";
import { saveLinkedinOverride } from "@/lib/admin/linkedinOverrides";
import { CMS_TAG } from "@/lib/admin/store";
import { validDate } from "@/lib/linkedin/dates.mjs";

export type LinkedInSaveState = { error?: string; saved?: boolean };

export async function saveLinkedInPost(_previous: LinkedInSaveState, form: FormData): Promise<LinkedInSaveState> {
  await requireAdmin();
  const url = String(form.get("url") ?? "").trim();
  const placement = String(form.get("placement") ?? "");
  const date = String(form.get("date") ?? "").trim();
  // The form names a saved post; it cannot add a destination or alter its words.
  if (!snapshot.posts.some((post) => post.permalink === url)) return { error: "This post is not in the current feed. Reload the page." };
  if (placement !== "calendar" && placement !== "community" && placement !== "hidden") {
    return { error: "Choose Calendar, Community, or Hide." };
  }
  if (date && !validDate(date)) return { error: "Enter a valid date." };
  try {
    await saveLinkedinOverride({ url, placement, date, at: new Date().toISOString() });
  } catch (error) {
    console.error("[admin] LinkedIn override save failed", error);
    return { error: "The Google Sheet did not save this change. Make sure that the sheet is configured, then try again." };
  }
  updateTag(CMS_TAG);
  revalidatePath("/media");
  revalidatePath("/programmes");
  revalidatePath("/admin/linkedin");
  return { saved: true };
}
