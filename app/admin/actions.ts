"use server";

// Server actions for the admin dashboard. Every one that changes data checks
// the session first: an action is a public endpoint whether or not a page links to it.

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  credentialsMatch, EMAIL, endSession, hashPassword, mayHaveAccount, normaliseEmail, requireAdmin, signupOpen, startSession,
} from "@/lib/admin/auth";
import { audit, auditWho } from "@/lib/admin/audit";
import {
  addAccount, CMS_TAG, findAccount, listItems, listSubscribers, updateItem,
} from "@/lib/admin/store";
import { allow } from "@/lib/security/throttle";
import { EMAIL_SETUP_HINT, emailConfigured, sendBatch, sendEmail } from "@/lib/email";
import { issueEmail } from "@/lib/newsletter";


/*
  Fix plan 2026-10-11, D6: a Google Sheets error (a busy quota, a timeout) is
  answered in the form, not thrown, so it cannot take the whole page with it.
*/
const SHEET_BUSY = "The Google Sheet did not answer. Nothing was changed; try again in a moment.";

async function attempt<T>(label: string, run: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false }> {
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    console.error(`[admin] ${label} failed`, error);
    return { ok: false };
  }
}

/* Ten tries per quarter hour, per address and per network address, so a guesser is slowed either way. */
const SIGN_IN_RULE = { limit: 10, windowMs: 15 * 60_000 };

async function throttled(kind: string, email: string) {
  const from = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  return !allow(`${kind}:ip:${from}`, SIGN_IN_RULE) || !allow(`${kind}:email:${email}`, SIGN_IN_RULE);
}

export async function login(_: string | null, form: FormData) {
  const email = normaliseEmail(form.get("email"));
  if (await throttled("login", email)) {
    await audit({ who: email, action: "login-failure", collection: "accounts", summary: "Sign-in attempts exceeded the limit." });
    return "Too many attempts. Wait a few minutes and try again.";
  }
  const match = await attempt("sign-in", () => credentialsMatch(email, String(form.get("password") ?? "")));
  if (!match.ok) await audit({ who: email, action: "login-failure", collection: "accounts", summary: "The account lookup failed." });
  if (!match.ok) return SHEET_BUSY;
  if (!match.value) {
    await audit({ who: email, action: "login-failure", collection: "accounts", summary: "Sign-in credentials did not match." });
    return "That email address and password do not match an account.";
  }
  await audit({ who: email, action: "login-success", collection: "accounts", summary: "Signed in." });
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
  const existing = await attempt("account lookup", () => findAccount(email));
  if (!existing.ok) return SHEET_BUSY;
  if (existing.value) return "There is already an account for that address. Sign in instead.";
  const hash = await hashPassword(password);
  if (!(await attempt("account save", () => addAccount({ email, hash, createdAt: new Date().toISOString() }))).ok) return SHEET_BUSY;
  await audit({ who: email, action: "signup", collection: "accounts", summary: "Created an account." });
  await startSession(email);
  redirect("/admin");
}

export async function logout() {
  await audit({ who: await auditWho(), action: "logout", collection: "accounts", summary: "Signed out." });
  await endSession();
  redirect("/admin/login");
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
  const issues = await attempt("issue lookup", () => listItems("newsletters"));
  if (!issues.ok) return SHEET_BUSY;
  const issue = issues.value.find((item) => item.id === id);
  if (!issue) return "That issue is no longer saved.";
  if (!issue.pdf) return "That issue has no PDF to link to.";

  const content = { issue: issue.issue, title: issue.title, summary: issue.summary, pdf: issue.pdf, image: issue.image };

  if (test) {
    const to = String(form.get("test") ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) return "Enter the address the test should go to.";
    const ok = await sendEmail(issueEmail(to, "test-token", content));
    await audit({ who: await auditWho(), action: "newsletter-test", collection: "newsletters", recordId: id, recordTitle: issue.title, summary: ok ? "Sent a test issue." : "The test issue did not send." });
    return ok ? null : "The test did not send. The server log has the reason.";
  }

  if (issue.sentAt && String(form.get("again")) !== "yes") {
    return `This issue was already sent on ${new Date(issue.sentAt).toLocaleDateString("en-GB")}. Tick "send it again" to send it once more.`;
  }

  const subscribers = await attempt("subscriber list", () => listSubscribers("confirmed"));
  if (!subscribers.ok) return SHEET_BUSY;
  if (subscribers.value.length === 0) return "Nobody has confirmed a subscription yet, so there is no one to send to.";

  const { sent, failed } = await sendBatch(
    subscribers.value.map((person) => issueEmail(person.email, person.token ?? "", content)),
  );
  // The emails are out either way; only the record of the send can fail here.
  const recorded = await attempt("send record", () => updateItem("newsletters", id, {
    sentAt: new Date().toISOString(),
    sentCount: String(sent),
  }));
  await audit({ who: await auditWho(), action: "newsletter-send", collection: "newsletters", recordId: id, recordTitle: issue.title, summary: `Sent to ${sent}; ${failed} failed.` });
  updateTag(CMS_TAG);
  revalidatePath("/admin", "layout");
  const unrecorded = recorded.ok ? "" : " The send could not be noted on the issue, so the dashboard will not show it as sent.";
  if (failed > 0) return `Sent to ${sent}. ${failed} did not go out; the server log has the reason.${unrecorded}`;
  return recorded.ok ? null : `Sent to ${sent}.${unrecorded}`;
}
