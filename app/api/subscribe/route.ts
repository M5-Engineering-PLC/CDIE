/*
  Newsletter sign-up, double opt-in.

  The address is recorded as pending and sent a confirmation link; nothing else
  reaches it until that link is opened. The answer tells the page which of three
  things happened, so the reader is told the truth rather than a blanket thank
  you: a new sign-up, an address already waiting to confirm, or one already on
  the list.

  Where sending is not configured the sign-up is still recorded and the answer
  says so, rather than losing the address.

  2026-09-25, security: a per-address throttle and a honeypot, as on /api/enquiry.
*/

import { revalidateTag } from "next/cache";

import { emailConfigured, sendEmail } from "@/lib/email";
import { confirmationEmail } from "@/lib/newsletter";
import { CMS_TAG, recordSubscription } from "@/lib/admin/store";
import { allow, clientAddress, isHoneypotFilled } from "@/lib/security/throttle";

export async function POST(request: Request) {
  if (!allow(`subscribe:${clientAddress(request)}`)) {
    return Response.json({ error: "too_many" }, { status: 429, headers: { "retry-after": "60" } });
  }

  let body: { email?: unknown } = {};
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    body = {};
  }
  if (isHoneypotFilled(body)) return Response.json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const { outcome, token } = await recordSubscription(email);
  revalidateTag(CMS_TAG, "max");

  if (outcome === "confirmed") return Response.json({ state: "already" });
  if (!emailConfigured()) return Response.json({ state: "recorded" });

  const sent = token ? await sendEmail(confirmationEmail(email, token)) : false;
  return Response.json({ state: sent ? "check" : "recorded" });
}
