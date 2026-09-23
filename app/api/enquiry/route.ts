/*
  The enquiry form's delivery route. Decision C-01, 2026-09-11: "have the form
  ready and wired to ive@ku.ac.ke".

  It sends through Resend's HTTP API, so there is no dependency to install and
  no SMTP credential in the repository. Three environment variables, set in
  Vercel:

    RESEND_API_KEY   the API key
    ENQUIRY_FROM     a sender on a domain verified with Resend
    ENQUIRY_TO       optional; defaults to the address below

  Until RESEND_API_KEY exists the route answers 503 with `not_configured`, and
  the form shows the team's own email instead of pretending to have sent
  something. A form that silently drops an enquiry is worse than one that says
  it cannot send, which is the whole reason this route exists rather than a
  disabled fieldset.
*/

import { revalidateTag } from "next/cache";

import { CMS_TAG, recordEnquiry } from "@/lib/admin/store";

const DEFAULT_TO = "ive@ku.ac.ke";
const MAX = { name: 120, email: 200, reason: 60, message: 5000 } as const;

type Payload = { name: string; email: string; reason: string; message: string };

function clean(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function validate(body: unknown): Payload | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as Record<string, unknown>;
  const payload: Payload = {
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
  let payload: Payload | null = null;
  try {
    payload = validate(await request.json());
  } catch {
    payload = null;
  }

  if (!payload) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  // Counted for the admin dashboard (reason and time only, never the message),
  // whether or not the email below can be sent.
  await recordEnquiry(payload.reason)
    .then(() => revalidateTag(CMS_TAG, "max"))
    .catch((error) => console.error("[enquiry] count failed", error));

  const key = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM;
  if (!key || !from) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Reason: ${payload.reason || "not given"}`,
    "",
    payload.message,
  ];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [process.env.ENQUIRY_TO || DEFAULT_TO],
        reply_to: payload.email,
        subject: `Website enquiry: ${payload.reason || "general"} — ${payload.name}`,
        text: lines.join("\n"),
      }),
    });

    if (!response.ok) {
      console.error("[enquiry] send failed", response.status, await response.text());
      return Response.json({ error: "send_failed" }, { status: 502 });
    }
  } catch (error) {
    console.error("[enquiry] send threw", error);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
