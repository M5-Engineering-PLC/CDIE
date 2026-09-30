/*
  Admin authentication. Enhancements 2026-09-22: "authentication to use the page".

  Review 2026-09-30: "add email input in sign in form as well as create new
  account option". Each person now signs in with their own email address and
  password. Accounts are stored with a scrypt hash, never the password
  (lib/admin/store.ts, the "accounts" tab), and are never written to the
  committed snapshot.

  Who may create an account is decided on the server, not by the form: only an
  address listed in ADMIN_EMAILS, or at a domain listed in ADMIN_EMAIL_DOMAINS
  (comma-separated). With neither set, account creation is closed. An open
  sign-up page would let anyone who finds /admin/login make themselves an admin.

  The shared ADMIN_PASSWORD still signs in, with any address on the list (or
  any address at all while no list is set), so the team is not locked out while
  accounts are being made. A correct sign-in gets a signed, http-only session
  cookie naming the person, for eight hours. The signature uses ADMIN_SECRET
  when set, otherwise ADMIN_PASSWORD; changing either signs everyone out.
*/

import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { findAccount } from "./store";

/*
  2026-09-22: "no login for the dashboard for now". While this is false the
  dashboard and its actions are open to anyone who knows the URL. Set
  ADMIN_AUTH=on to switch sign-in back on.
*/
export const AUTH_ENABLED = process.env.ADMIN_AUTH === "on";

const COOKIE = "cdie_admin";
const TTL_MS = 8 * 60 * 60 * 1000;
const derive = promisify(scrypt) as (password: string, salt: Buffer, length: number) => Promise<Buffer>;

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const listOf = (value?: string) => (value ?? "").split(",").map((entry) => entry.trim().toLowerCase().replace(/^@/, "")).filter(Boolean);
const allowedEmails = () => listOf(process.env.ADMIN_EMAILS);
const allowedDomains = () => listOf(process.env.ADMIN_EMAIL_DOMAINS);

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normaliseEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();

/** True when this address is on the list of people who may hold an account. */
export function mayHaveAccount(email: string) {
  return allowedEmails().includes(email) || allowedDomains().some((domain) => email.endsWith(`@${domain}`));
}

export const signupOpen = () => Boolean(secret()) && (allowedEmails().length > 0 || allowedDomains().length > 0);
export const adminConfigured = () => Boolean(secret()) && (Boolean(process.env.ADMIN_PASSWORD) || signupOpen());

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await derive(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function passwordFits(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await derive(password, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

/** True when the address and password belong together. */
export async function credentialsMatch(email: string, password: string) {
  if (!EMAIL.test(email) || !password) return false;
  const account = await findAccount(email);
  if (account) return passwordFits(password, account.hash);
  const shared = process.env.ADMIN_PASSWORD;
  const listed = allowedEmails().length === 0 && allowedDomains().length === 0 ? true : mayHaveAccount(email);
  return Boolean(shared) && listed && same(sign(password), sign(shared as string));
}

export async function startSession(email: string) {
  const expires = Date.now() + TTL_MS;
  const who = Buffer.from(email).toString("base64url");
  const store = await cookies();
  store.set(COOKIE, `${expires}.${who}.${sign(`${expires}.${who}`)}`, {
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

/** The signed-in address, or null. With sign-in switched off there is no one to name. */
export async function currentAdmin(): Promise<string | null> {
  if (!adminConfigured()) return null;
  const [expires, who, signature] = ((await cookies()).get(COOKIE)?.value ?? "").split(".");
  if (!expires || !who || !signature || Number(expires) < Date.now()) return null;
  if (!same(signature, sign(`${expires}.${who}`))) return null;
  return Buffer.from(who, "base64url").toString();
}

export async function isAdmin() {
  if (!AUTH_ENABLED) return true;
  return (await currentAdmin()) !== null;
}

/** Call at the top of every protected page and every server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
