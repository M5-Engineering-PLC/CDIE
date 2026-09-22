/*
  Admin authentication. Enhancements 2026-09-22: "authentication to use the page".

  One shared password, set as ADMIN_PASSWORD in the environment. A correct
  password gets a signed, http-only session cookie that lasts eight hours. The
  signature uses ADMIN_SECRET when set, otherwise the password itself, so
  changing either signs everyone out. With no ADMIN_PASSWORD the dashboard is
  closed to everyone rather than open to anyone.
*/

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/*
  2026-09-22: "no login for the dashboard for now". While this is false the
  dashboard and its actions are open to anyone who knows the URL. Set
  ADMIN_AUTH=on (and ADMIN_PASSWORD) to switch sign-in back on.
*/
export const AUTH_ENABLED = process.env.ADMIN_AUTH === "on";

const COOKIE = "cdie_admin";
const TTL_MS = 8 * 60 * 60 * 1000;

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && same(sign(candidate), sign(expected as string));
}

export async function startSession() {
  const expires = Date.now() + TTL_MS;
  const store = await cookies();
  store.set(COOKIE, `${expires}.${sign(String(expires))}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: new Date(expires),
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function isAdmin() {
  if (!AUTH_ENABLED) return true;
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value ?? "";
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return same(signature, sign(expires));
}

/** Call at the top of every protected page and every server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
