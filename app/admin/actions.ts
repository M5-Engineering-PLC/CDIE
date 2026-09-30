"use server";

// Server actions for the admin dashboard. Every one that changes data checks
// the session first: an action is a public endpoint whether or not a page links to it.

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  credentialsMatch, EMAIL, endSession, hashPassword, mayHaveAccount, normaliseEmail, requireAdmin, signupOpen, startSession,
} from "@/lib/admin/auth";
import { siteItems } from "@/lib/admin/builtins";
import { collectionById, onDashboard, type CollectionId } from "@/lib/admin/collections";
import {
  addAccount, addItem, CMS_TAG, findAccount, hideBuiltIn, listItems, listSubscribers, removeItem, saveUpload, unhideBuiltIn, updateItem,
} from "@/lib/admin/store";
import { allow } from "@/lib/security/throttle";
import { EMAIL_SETUP_HINT, emailConfigured, sendBatch, sendEmail } from "@/lib/email";
import { issueEmail } from "@/lib/newsletter";

const IMAGE = /^image\/(jpeg|png|webp|gif|avif)$/;

/* Ten tries per quarter hour, per address and per network address, so a guesser is slowed either way. */
const SIGN_IN_RULE = { limit: 10, windowMs: 15 * 60_000 };

async function throttled(kind: string, email: string) {
  const from = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  return !allow(`${kind}:ip:${from}`, SIGN_IN_RULE) || !allow(`${kind}:email:${email}`, SIGN_IN_RULE);
}

export async function login(_: string | null, form: FormData) {
  const email = normaliseEmail(form.get("email"));
  if (await throttled("login", email)) return "Too many attempts. Wait a few minutes and try again.";
  if (!(await credentialsMatch(email, String(form.get("password") ?? "")))) {
    return "That email address and password do not match an account.";
  }
  await startSession(email);
  redirect("/admin");
}

/*
  Review 2026-09-30: "create new account option in admin login". Only an
  address on ADMIN_EMAILS or at a domain on ADMIN_EMAIL_DOMAINS can make one
  (lib/admin/auth.ts); the check is here, on the server, not in the form.
*/
export async function signup(_: string | null, form: FormData) {
  if (!signupOpen()) return "New accounts cannot be made on this server yet. Ask the site administrator.";
  const email = normaliseEmail(form.get("email"));
  const password = String(form.get("password") ?? "");
  if (await throttled("signup", email)) return "Too many attempts. Wait a few minutes and try again.";
  if (!EMAIL.test(email)) return "Enter a valid email address.";
  if (!mayHaveAccount(email)) return "That address cannot hold a dashboard account. Ask the site administrator to add it.";
  if (password.length < 12) return "Use a password of at least 12 characters.";
  if (password !== String(form.get("confirm") ?? "")) return "The two passwords do not match.";
  if (await findAccount(email)) return "There is already an account for that address. Sign in instead.";
  await addAccount({ email, hash: await hashPassword(password), createdAt: new Date().toISOString() });
  await startSession(email);
  redirect("/admin");
}

/*
  Review 2026-09-30: a record that ships with the site is hidden rather than
  deleted, and can be put back. The key must name one of the site's own
  records, so the form cannot be used to write arbitrary rows.
*/
export async function hideItem(form: FormData) {
  await requireAdmin();
  const collection = onDashboard(String(form.get("collection")));
  const key = String(form.get("key"));
  if (!collection || !siteItems(collection.id).some((item) => item.key === key)) return;
  await (String(form.get("restore")) === "yes" ? unhideBuiltIn(collection.id, key) : hideBuiltIn(collection.id, key));
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function createItem(_: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();
  const collection = onDashboard(String(form.get("collection")));
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
