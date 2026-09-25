/*
  Where an enquiry goes once the route has validated it.

  Daily note 2026-09-25, "email api": the ask is a quick, free way to send the
  filled contact form to Ive's Gmail without an email service provider and a
  verified domain. Three providers, tried in this order, first configured wins:

  1. Resend, when RESEND_API_KEY and ENQUIRY_FROM are set. Needs a domain
     verified with Resend. Kept for when the team has one.
  2. Web3Forms, when WEB3FORMS_ACCESS_KEY is set. Free tier, no domain, no
     account beyond the access key, which is issued to the inbox it delivers
     to. Make the key with Ive's Gmail address and every form lands there.
  3. A Google Apps Script web app, when ENQUIRY_WEBHOOK_URL is set. Free and
     entirely inside Ive's own Google account: the script receives the form
     and sends it to the same account with MailApp. The script is in
     docs/SECRETS_CHECKLIST.md. Only a script.google.com address is accepted,
     so a mistyped variable cannot turn the route into a general poster.

  With none configured the route answers 503 and the form shows the team's
  address, as it always has: a form that silently drops an enquiry is worse
  than one that says it cannot send.
*/

export type Enquiry = { name: string; email: string; reason: string; message: string };

export type Delivery = { ok: true; provider: string } | { ok: false; reason: "not_configured" | "send_failed" };

const DEFAULT_TO = "ive@ku.ac.ke";

const subjectFor = (enquiry: Enquiry) => `Website enquiry: ${enquiry.reason || "general"}; ${enquiry.name}`;

const textFor = (enquiry: Enquiry) =>
  [`Name: ${enquiry.name}`, `Email: ${enquiry.email}`, `Reason: ${enquiry.reason || "not given"}`, "", enquiry.message].join("\n");

async function post(url: string, body: unknown, headers: Record<string, string> = {}): Promise<boolean> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!response.ok) console.error("[enquiry] send failed", url, response.status, await response.text());
  return response.ok;
}

async function viaResend(enquiry: Enquiry, env: NodeJS.ProcessEnv): Promise<boolean | null> {
  const key = env.RESEND_API_KEY;
  const from = env.ENQUIRY_FROM;
  if (!key || !from) return null;
  return post(
    "https://api.resend.com/emails",
    { from, to: [env.ENQUIRY_TO || DEFAULT_TO], reply_to: enquiry.email, subject: subjectFor(enquiry), text: textFor(enquiry) },
    { authorization: `Bearer ${key}` },
  );
}

async function viaWeb3Forms(enquiry: Enquiry, env: NodeJS.ProcessEnv): Promise<boolean | null> {
  const key = env.WEB3FORMS_ACCESS_KEY;
  if (!key) return null;
  return post("https://api.web3forms.com/submit", {
    access_key: key,
    subject: subjectFor(enquiry),
    from_name: "CDIE website",
    name: enquiry.name,
    email: enquiry.email,
    reason: enquiry.reason,
    message: enquiry.message,
  });
}

export function isAppsScriptUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "script.google.com";
  } catch {
    return false;
  }
}

async function viaWebhook(enquiry: Enquiry, env: NodeJS.ProcessEnv): Promise<boolean | null> {
  const url = env.ENQUIRY_WEBHOOK_URL?.trim();
  if (!url) return null;
  if (!isAppsScriptUrl(url)) {
    console.error("[enquiry] ENQUIRY_WEBHOOK_URL must be an https script.google.com address");
    return false;
  }
  return post(url, { ...enquiry, to: env.ENQUIRY_TO || DEFAULT_TO, subject: subjectFor(enquiry), text: textFor(enquiry) });
}

const providers = [
  ["resend", viaResend],
  ["web3forms", viaWeb3Forms],
  ["webhook", viaWebhook],
] as const;

export async function deliverEnquiry(enquiry: Enquiry, env: NodeJS.ProcessEnv = process.env): Promise<Delivery> {
  for (const [name, send] of providers) {
    let sent: boolean | null;
    try {
      sent = await send(enquiry, env);
    } catch (error) {
      console.error("[enquiry] send threw", name, error);
      sent = false;
    }
    if (sent === null) continue;
    return sent ? { ok: true, provider: name } : { ok: false, reason: "send_failed" };
  }
  return { ok: false, reason: "not_configured" };
}
