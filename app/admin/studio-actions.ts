"use server";

/*
  Review 2026-09-30, dashboard Design Studio: "only thing they can change is
  photographs, show current ones and a plus icon to add more images, change
  order, delete them".

  A capability's photographs start as the ones in content/studio.ts. The first
  save keeps the whole ordered list for that capability (store,
  saveStudioPhotos), and from then on the public page reads that list instead.
  The first photograph leads: it is the capability card's picture and the
  explorer's opening photograph.

  Fix plan 2026-10-11, D2 and D7: nothing here runs per click any more. The
  page drafts the changes and sends them all at once, and this action:
  1. reads the saved lists fresh, never from the cache
  2. checks every change, and saves nothing if one fails
  3. refuses an area someone else saved after the page was opened
  4. uploads the new photographs, writes one row per area and syncs once
*/

import { revalidatePath, updateTag } from "next/cache";

import { audit, auditWho } from "@/lib/admin/audit";
import { capabilities } from "@/content/studio";
import { requireAdmin } from "@/lib/admin/auth";
import { CMS_TAG, saveStudioPhotos, saveUpload, studioPhotoLists, type StudioPhoto } from "@/lib/admin/store";
import type { StudioChange } from "@/lib/admin/studioDraft";

const IMAGE = /^image\/(jpeg|png|webp|avif)$/;

export type PublishResult = { error: string; area?: string } | null;

type Upload = { index: number; file: File; alt: string; width: number; height: number };
type Plan = { capability: string; photos: StudioPhoto[]; uploads: Upload[] };

const plain = ({ src, alt, width, height }: StudioPhoto): StudioPhoto => ({ src, alt, width, height });

function readChanges(form: FormData): StudioChange[] | null {
  try {
    const changes = JSON.parse(String(form.get("changes") ?? ""));
    return Array.isArray(changes) ? changes : null;
  } catch {
    return null;
  }
}

function checkUpload(form: FormData, entry: { file: string; alt: string; width: number; height: number }, index: number): Upload | string {
  const file = entry.file.startsWith("new:") ? form.get(entry.file) : null;
  if (!(file instanceof File) || file.size === 0) return "A new photograph did not reach the server. Add it again.";
  if (!IMAGE.test(file.type)) return "A new photograph is not a JPEG, PNG, WebP or AVIF image.";
  const alt = String(entry.alt ?? "").trim().slice(0, 200);
  if (!alt) return "Every new photograph needs a description, for people who cannot see it.";
  const width = Number(entry.width);
  const height = Number(entry.height);
  if (!(width > 0 && height > 0 && width < 20000 && height < 20000)) return "A new photograph could not be read. Add it again.";
  return { index, file, alt, width: Math.round(width), height: Math.round(height) };
}

export async function publishStudioChanges(form: FormData): Promise<PublishResult> {
  await requireAdmin();
  const changes = readChanges(form);
  if (!changes || changes.length === 0) return { error: "There are no changes to save." };

  let saved: Awaited<ReturnType<typeof studioPhotoLists>>;
  try {
    saved = await studioPhotoLists(true);
  } catch (error) {
    console.error("[admin] studio photographs read failed", error);
    return { error: "The Google Sheet did not answer, so nothing was saved. Your changes are still here; try again in a moment." };
  }

  const plans: Plan[] = [];
  for (const change of changes) {
    const capability = capabilities.find((item) => item.id === change?.capability);
    if (!capability || plans.some((plan) => plan.capability === capability.id) || !Array.isArray(change.photos)) {
      return { error: "One of the workshop areas is not recognised. Reload the page and try again." };
    }
    const area = capability.id;
    if ((saved[area]?.at ?? "") !== String(change.base ?? "")) {
      return { area, error: `Someone saved the ${capability.name} photographs after you opened this page. Reload the page to see their version, then make your changes again.` };
    }
    // An existing photograph is named by its address only; what it shows is looked up here, never taken from the form.
    const known = new Map([...capability.media, ...(saved[area]?.photos ?? [])].map((photo) => [photo.src, plain(photo)]));
    const plan: Plan = { capability: area, photos: [], uploads: [] };
    for (const [index, entry] of change.photos.entries()) {
      if (!entry || typeof entry !== "object") return { area, error: "The changes could not be read. Reload the page and try again." };
      if ("src" in entry) {
        const photo = known.get(entry.src);
        if (!photo) return { area, error: `A ${capability.name} photograph is no longer there. Reload the page and try again.` };
        plan.photos.push(photo);
      } else {
        const upload = checkUpload(form, entry, index);
        if (typeof upload === "string") return { area, error: `${capability.name}: ${upload}` };
        plan.uploads.push(upload);
        plan.photos.push({ src: "", alt: upload.alt, width: upload.width, height: upload.height });
      }
    }
    // A workshop area always keeps one photograph; the card and the explorer need it.
    if (plan.photos.length === 0) return { area, error: `${capability.name} needs at least one photograph.` };
    plans.push(plan);
  }

  try {
    for (const plan of plans) {
      for (const upload of plan.uploads) plan.photos[upload.index].src = await saveUpload(upload.file);
    }
    await saveStudioPhotos(plans.map(({ capability, photos }) => ({ capability, photos, base: saved[capability]?.at ?? "" })));
  } catch (error) {
    console.error("[admin] studio photographs save failed", error);
    return { error: "That did not save. Your changes are still here; try again in a moment." };
  }

  const who = await auditWho();
  for (const plan of plans) await audit({ who, action: "studio-photos", collection: "studio", recordId: plan.capability, recordTitle: capabilities.find((area) => area.id === plan.capability)?.name, summary: `Saved ${plan.photos.length} photographs in the reviewed order.` });
  updateTag(CMS_TAG);
  revalidatePath("/design-studio");
  revalidatePath("/admin/studio");
  return null;
}
