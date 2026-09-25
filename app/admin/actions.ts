"use server";

// Server actions for the admin dashboard. Every one that changes data checks
// the session first: an action is a public endpoint whether or not a page links to it.

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { endSession, passwordMatches, requireAdmin, startSession } from "@/lib/admin/auth";
import { collectionById, type CollectionId } from "@/lib/admin/collections";
import { addItem, CMS_TAG, listItems, listSubscribers, removeItem, saveUpload, updateItem } from "@/lib/admin/store";
import { EMAIL_SETUP_HINT, emailConfigured, sendBatch, sendEmail } from "@/lib/email";
import { issueEmail } from "@/lib/newsletter";

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

  try {
    await addItem(collection.id, fields);
  } catch (error) {
    console.error("[admin] save failed", error);
    return "The Google Sheet did not accept that. Nothing was saved; try again in a moment.";
  }
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
  return null;
}

export async function deleteItem(form: FormData) {
  await requireAdmin();
  const collection = collectionById(String(form.get("collection")));
  if (!collection) return;
  await removeItem(collection.id as CollectionId, String(form.get("id")));
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
}

/*
  Sends one newsletter issue to the list. 2026-09-25: sending is a deliberate
  step, never a side effect of saving a record, and a test send to one address
  comes first so nobody discovers a broken link in front of the whole list.

  What went out is written back onto the issue (when, to how many), so the
  dashboard can say so and a second click cannot quietly send it twice.
*/
export async function sendIssue(_: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();
  if (!emailConfigured()) return EMAIL_SETUP_HINT;

  const id = String(form.get("id"));
  const test = String(form.get("mode")) === "test";
  const issue = (await listItems("newsletters")).find((item) => item.id === id);
  if (!issue) return "That issue is no longer saved.";
  if (!issue.pdf) return "That issue has no PDF to link to.";

  const content = { issue: issue.issue, title: issue.title, summary: issue.summary, pdf: issue.pdf, image: issue.image };

  if (test) {
    const to = String(form.get("test") ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) return "Enter the address the test should go to.";
    const ok = await sendEmail(issueEmail(to, "test-token", content));
    return ok ? null : "The test did not send. The server log has the reason.";
  }

  if (issue.sentAt && String(form.get("again")) !== "yes") {
    return `This issue was already sent on ${new Date(issue.sentAt).toLocaleDateString("en-GB")}. Tick "send it again" to send it once more.`;
  }

  const subscribers = await listSubscribers("confirmed");
  if (subscribers.length === 0) return "Nobody has confirmed a subscription yet, so there is no one to send to.";

  const { sent, failed } = await sendBatch(
    subscribers.map((person) => issueEmail(person.email, person.token ?? "", content)),
  );
  await updateItem("newsletters", id, {
    sentAt: new Date().toISOString(),
    sentCount: String(sent),
  });
  updateTag(CMS_TAG);
  revalidatePath("/admin", "layout");
  return failed > 0 ? `Sent to ${sent}. ${failed} did not go out; the server log has the reason.` : null;
}
