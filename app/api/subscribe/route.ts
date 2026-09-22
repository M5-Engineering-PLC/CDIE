/*
  Newsletter sign-up. Enhancements 2026-09-22, Dashboard analytics: "newsletter
  subscriptions". Each address is recorded once in the admin store, where the
  dashboard counts it. Nothing is emailed from here.
*/

import { recordSubscription } from "@/lib/admin/store";

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  } catch {
    email = "";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  await recordSubscription(email);
  return Response.json({ ok: true });
}
