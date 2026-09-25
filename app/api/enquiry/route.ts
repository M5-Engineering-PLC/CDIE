/*
  The enquiry form's delivery route. Decision C-01, 2026-09-11: "have the form
  ready and wired to ive@ku.ac.ke".

  This file validates and counts. Delivery lives in lib/enquiry/deliver.ts,
  which tries Resend, Web3Forms and an Apps Script webhook in that order; the
  daily note of 2026-09-25 asked for a free path to Ive's Gmail, and the last
  two need no domain and no paid plan.

  Until a provider is configured the route answers 503 with `not_configured`,
  and the form shows the team's own email instead of pretending to have sent
  something. A form that silently drops an enquiry is worse than one that says
  it cannot send, which is the whole reason this route exists rather than a
  disabled fieldset.

  2026-09-25, security: a per-address throttle and a honeypot. A filled
  honeypot gets the success answer and no delivery.
*/

import { revalidateTag } from "next/cache";

import { CMS_TAG, recordEnquiry } from "@/lib/admin/store";
import { deliverEnquiry, type Enquiry } from "@/lib/enquiry/deliver";
import { allow, clientAddress, isHoneypotFilled } from "@/lib/security/throttle";

const MAX = { name: 120, email: 200, reason: 60, message: 5000 } as const;

function clean(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function validate(body: unknown): Enquiry | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as Record<string, unknown>;
  const payload: Enquiry = {
    name: clean(raw.name, MAX.name),
    email: clean(raw.email, MAX.email),
    reason: clean(raw.reason, MAX.reason),
    message: clean(raw.message, MAX.message),
  };
  if (!payload.name || !payload.message) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) return null;
  return payload;
}

export async function POST(request: Request) {
  if (!allow(`enquiry:${clientAddress(request)}`)) {
    return Response.json({ error: "too_many" }, { status: 429, headers: { "retry-after": "60" } });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  if (isHoneypotFilled(body)) return Response.json({ ok: true });

  const payload = validate(body);
  if (!payload) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  // Counted for the admin dashboard (reason and time only, never the message),
  // whether or not the email below can be sent.
  await recordEnquiry(payload.reason)
    .then(() => revalidateTag(CMS_TAG, "max"))
    .catch((error) => console.error("[enquiry] count failed", error));

  const delivery = await deliverEnquiry(payload);
  if (!delivery.ok) {
    return Response.json({ error: delivery.reason }, { status: delivery.reason === "not_configured" ? 503 : 502 });
  }
  return Response.json({ ok: true });
}
