"use server";

// Server actions for the admin dashboard. Every one that changes data checks
// the session first: an action is a public endpoint whether or not a page links to it.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { endSession, passwordMatches, requireAdmin, startSession } from "@/lib/admin/auth";
import { collectionById, type CollectionId } from "@/lib/admin/collections";
import { addItem, removeItem, saveUpload } from "@/lib/admin/store";

const IMAGE = /^image\/(jpeg|png|webp|gif|avif)$/;

export async function login(_: string | null, form: FormData) {
  if (!passwordMatches(String(form.get("password") ?? ""))) return "That password is not right.";
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function createItem(_: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();
  const collection = collectionById(String(form.get("collection")));
  if (!collection) return "Unknown section.";

  const fields: Record<string, string> = {};
  for (const field of collection.fields) {
    const raw = form.get(field.name);
    if (field.type === "image" || field.type === "pdf") {
      const file = raw instanceof File && raw.size > 0 ? raw : null;
      if (file) {
        const ok = field.type === "pdf" ? file.type === "application/pdf" : IMAGE.test(file.type);
        if (!ok) return `${field.label} must be ${field.type === "pdf" ? "a PDF" : "a JPEG, PNG, WebP, GIF or AVIF image"}.`;
        fields[field.name] = await saveUpload(file);
      }
    } else if (typeof raw === "string" && raw.trim()) {
      fields[field.name] = raw.trim().slice(0, field.type === "textarea" ? 4000 : 300);
    }
    if (field.required && !fields[field.name]) return `${field.label} is required.`;
  }
  if (fields.end && fields.start && fields.end < fields.start) return "The end date is before the start date.";

  await addItem(collection.id, fields);
  revalidatePath("/", "layout");
  return null;
}

export async function deleteItem(form: FormData) {
  await requireAdmin();
  const collection = collectionById(String(form.get("collection")));
  if (!collection) return;
  await removeItem(collection.id as CollectionId, String(form.get("id")));
  revalidatePath("/", "layout");
}
