/*
  The Google Sheet as the dashboard's database.

  Final pass 2026-09-23: "the google sheets that is linked as env variable
  should act as our internal database and should be updated by any updates on
  dashboard". Every dashboard collection is a tab of the same spreadsheet the
  LinkedIn feed publishes from; row 1 is the header, one row per record.

  Plain Sheets API v4 over fetch, signed with a service account through
  node:crypto, so there is no SDK to install. The file imports nothing but Node
  built-ins on purpose: scripts/sync-cms.ts (the GitHub Action) imports it
  directly with Node's type stripping, and a path alias would break that.

  Environment (all three or none):
    GOOGLE_SHEET_ID                 the id in the sheet's editing URL, /d/<id>/edit
    GOOGLE_SERVICE_ACCOUNT_EMAIL    the service account's client_email
    GOOGLE_PRIVATE_KEY              its private_key; literal \n sequences are fine
  Share the sheet with the service account email as an Editor.
*/

import { createSign } from "node:crypto";

const API = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export type SheetRow = Record<string, string>;

type Credentials = { sheetId: string; email: string; key: string };

export function sheetCredentials(env: Record<string, string | undefined> = process.env): Credentials | null {
  const sheetId = env.GOOGLE_SHEET_ID?.trim();
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const key = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  return sheetId && email && key ? { sheetId, email, key } : null;
}

export const sheetsConfigured = () => sheetCredentials() !== null;

let token: { value: string; expires: number } | null = null;

async function accessToken(creds: Credentials): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: creds.email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(creds.key, "base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google token request failed: ${response.status} ${await response.text()}`);
  const body = (await response.json()) as { access_token: string; expires_in: number };
  token = { value: body.access_token, expires: Date.now() + body.expires_in * 1000 };
  return token.value;
}

type Init = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

async function call<T>(path: string, init: Init = {}): Promise<T> {
  const creds = sheetCredentials();
  if (!creds) throw new Error("Google Sheet is not configured.");
  const response = await fetch(`${API}/${creds.sheetId}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${await accessToken(creds)}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) throw new Error(`Sheets API ${response.status}: ${await response.text()}`);
  return (await response.json()) as T;
}

const range = (tab: string, cells = "A:ZZ") => encodeURIComponent(`'${tab.replace(/'/g, "''")}'!${cells}`);

type SheetMeta = { properties: { sheetId: number; title: string } };

async function tabs(): Promise<SheetMeta[]> {
  const meta = await call<{ sheets: SheetMeta[] }>("?fields=sheets.properties(sheetId,title)", { cache: "no-store" });
  return meta.sheets;
}

/** Creates the tab if it is missing and makes sure every header is present. Returns the header row. */
async function ensureTab(tab: string, headers: string[]): Promise<string[]> {
  if (!(await tabs()).some((sheet) => sheet.properties.title === tab)) {
    await call(":batchUpdate", {
      method: "POST",
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
    });
  }
  const current = (await call<{ values?: string[][] }>(`/values/${range(tab, "1:1")}`, { cache: "no-store" })).values?.[0] ?? [];
  const missing = headers.filter((header) => !current.includes(header));
  if (missing.length === 0 && current.length > 0) return current;
  const next = [...current, ...missing];
  await call(`/values/${range(tab, "1:1")}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [next] }),
  });
  return next;
}

function toRows(values: string[][] | undefined): SheetRow[] {
  if (!values || values.length < 2) return [];
  const [header, ...records] = values;
  return records
    .filter((record) => record.some((cell) => String(cell ?? "").trim()))
    .map((record) => Object.fromEntries(header.map((key, index) => [key, String(record[index] ?? "")])));
}

/** Reads a whole tab as objects keyed by the header row. A missing tab reads as empty. */
export async function readTab(tab: string, cache: { revalidate?: number; tags?: string[] } = {}): Promise<SheetRow[]> {
  try {
    const body = await call<{ values?: string[][] }>(`/values/${range(tab)}`, { next: cache });
    return toRows(body.values);
  } catch (error) {
    if (String(error).includes("Unable to parse range")) return [];
    throw error;
  }
}

/** Reads several tabs in one request. */
export async function readTabs(names: string[], cache: { revalidate?: number; tags?: string[] } = {}): Promise<Record<string, SheetRow[]>> {
  const present = new Set((await tabs()).map((sheet) => sheet.properties.title));
  const wanted = names.filter((name) => present.has(name));
  const result: Record<string, SheetRow[]> = Object.fromEntries(names.map((name) => [name, []]));
  if (wanted.length === 0) return result;
  const query = wanted.map((name) => `ranges=${range(name)}`).join("&");
  const body = await call<{ valueRanges: { values?: string[][] }[] }>(`/values:batchGet?${query}`, { next: cache });
  wanted.forEach((name, index) => { result[name] = toRows(body.valueRanges[index]?.values); });
  return result;
}

/** Appends one record. Columns the tab does not have yet are added to the header first. */
export async function appendRow(tab: string, row: SheetRow): Promise<void> {
  const header = await ensureTab(tab, Object.keys(row));
  await call(`/values/${range(tab, "A1")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values: [header.map((key) => row[key] ?? "")] }),
  });
}

/** Deletes every row whose `key` column equals `value`. */
export async function deleteRows(tab: string, key: string, value: string): Promise<number> {
  const sheet = (await tabs()).find((item) => item.properties.title === tab);
  if (!sheet) return 0;
  const values = (await call<{ values?: string[][] }>(`/values/${range(tab)}`, { cache: "no-store" })).values ?? [];
  const column = values[0]?.indexOf(key) ?? -1;
  if (column < 0) return 0;
  const matches = values.flatMap((record, index) => (index > 0 && record[column] === value ? [index] : []));
  if (matches.length === 0) return 0;
  // Bottom-up, so earlier deletions do not shift the rows still to go.
  await call(":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: matches.reverse().map((index) => ({
        deleteDimension: {
          range: { sheetId: sheet.properties.sheetId, dimension: "ROWS", startIndex: index, endIndex: index + 1 },
        },
      })),
    }),
  });
  return matches.length;
}
