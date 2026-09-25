/*
  Daily note 2026-09-25, "security and standard web practices": the two public
  write routes (/api/enquiry, /api/subscribe) get a per-address throttle and a
  honeypot.

  The throttle is a fixed window kept in memory. On a serverless host each
  instance keeps its own window, so it bounds a burst against one instance
  rather than a distributed flood; that is the right size of defence for a
  contact form, and it needs no store, no key and no vendor. Anything larger
  belongs at the edge (the host's WAF or rate-limit rules), not in the app.
*/

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();
const MAX_KEYS = 5000;

export type ThrottleRule = { limit: number; windowMs: number };

/** Ten a minute per address for a human form; a script hits this at once. */
export const FORM_RULE: ThrottleRule = { limit: 10, windowMs: 60_000 };

export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** True when this key may proceed; false when its window is spent. */
export function allow(key: string, rule: ThrottleRule = FORM_RULE, now = Date.now()): boolean {
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    if (windows.size >= MAX_KEYS) windows.clear();
    windows.set(key, { count: 1, resetAt: now + rule.windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= rule.limit;
}

/**
  The honeypot. The form carries a field a person never sees and never fills.
  A submission that fills it is a bot: the route answers as if it succeeded and
  does nothing, so the script learns nothing from the response.
*/
export const HONEYPOT_FIELD = "company_website";

export function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}

/** For tests: forget every window. */
export function resetThrottle() {
  windows.clear();
}
