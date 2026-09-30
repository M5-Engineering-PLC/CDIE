"use server";

/*
  Review 2026-09-30, dashboard Design Studio: "only thing they can change is
  photographs, show current ones and a plus icon to add more images, change
  order, delete them".

  A capability's photographs start as the ones in content/studio.ts. The first
  change saves the whole ordered list for that capability (store,
  saveStudioPhotos), and from then on the public page reads that list instead.
  The first photograph leads: it is the capability card's picture and the
  explorer's opening photograph.
*/

import { revalidatePath, updateTag } from "next/cache";

import { capabilities } from "@/content/studio";
import { requireAdmin } from "@/lib/admin/auth";
import { CMS_TAG, saveStudioPhotos, saveUpload, studioPhotoOverrides, type StudioPhoto } from "@/lib/admin/store";

const IMAGE = /^image\/(jpeg|png|webp|avif)$/;

async function photosOf(id: string): Promise<StudioPhoto[] | null> {
  const capability = capabilities.find((item) => item.id === id);
  if (!capability) return null;
  const overrides = await studioPhotoOverrides();
  return overrides[id] ?? capability.media.map(({ src, alt, width, height }) => ({ src, alt, width, height }));
}

async function publish(id: string, photos: StudioPhoto[]) {
  await saveStudioPhotos(id, photos);
  updateTag(CMS_TAG);
  revalidatePath("/design-studio");
  revalidatePath("/admin/studio");
}

export async function addStudioPhoto(_: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();
  const id = String(form.get("capability"));
  const photos = await photosOf(id);
  if (!photos) return "Unknown workshop area.";
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return "Choose a photograph to add.";
  if (!IMAGE.test(file.type)) return "The photograph must be a JPEG, PNG, WebP or AVIF image.";
  const alt = String(form.get("alt") ?? "").trim().slice(0, 200);
  if (!alt) return "Describe the photograph in a sentence, for people who cannot see it.";
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  if (!(width > 0 && height > 0 && width < 20000 && height < 20000)) return "That image could not be read. Try another file.";
  try {
    const src = await saveUpload(file);
    await publish(id, [...photos, { src, alt, width: Math.round(width), height: Math.round(height) }]);
  } catch (error) {
    console.error("[admin] studio photograph save failed", error);
    return "That did not save. Nothing changed; try again in a moment.";
  }
  return null;
}

export async function changeStudioPhotos(form: FormData) {
  await requireAdmin();
  const id = String(form.get("capability"));
  const photos = await photosOf(id);
  const index = Number(form.get("index"));
  if (!photos || !Number.isInteger(index) || index < 0 || index >= photos.length) return;
  const next = [...photos];
  const op = String(form.get("op"));
  if (op === "delete") {
    // A workshop area always keeps one photograph; the card and the explorer need it.
    if (next.length === 1) return;
    next.splice(index, 1);
  } else {
    const to = op === "up" ? index - 1 : index + 1;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
  }
  await publish(id, next);
}
