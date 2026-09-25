/*
  Newsletter sign-up. Enhancements 2026-09-22, Dashboard analytics: "newsletter
  subscriptions". Each address is recorded once in the admin store, where the
  dashboard counts it. Nothing is emailed from here.

  2026-09-25, security: a per-address throttle and a honeypot, as on /api/enquiry.
*/

import { revalidateTag } from "next/cache";

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
  await recordSubscription(email);
  revalidateTag(CMS_TAG, "max");
  return Response.json({ ok: true });
}
