/*
  Sending email, shared by the newsletter (confirmation links and issues) and
  available to anything else that needs to reach an address.

  2026-09-25: aligned with the contact form's providers (lib/enquiry/deliver.ts).
  Two can send to any address, tried in this order:

    1. Resend        RESEND_API_KEY and ENQUIRY_FROM (a sender on a domain
                     verified with Resend). Batches of 100.
    2. Apps Script   ENQUIRY_WEBHOOK_URL, the same Google Apps Script web app
                     the contact form posts to, running in Ive's account. Free,
                     no domain, one message a call, about 100 a day on a
                     consumer Gmail account. The script honours "to" only when
                     the request carries ENQUIRY_WEBHOOK_SECRET, so a leaked
                     address cannot turn it into an open relay.

  Web3Forms is not here on purpose: its key delivers to one inbox only, so it
  can carry a contact form but never a newsletter.

  Nothing here retries or queues. A caller that sends to a list does so in
  batches and reports what failed, because a half-sent newsletter the team does
  not know about is worse than one that stopped.
*/

const ENDPOINT = "https://api.resend.com/emails";
const BATCH = "https://api.resend.com/emails/batch";
/** Resend accepts 100 messages a batch. */
const BATCH_SIZE = 100;

export type Message = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

export type EmailProvider = "resend" | "webhook";

const resendConfigured = (env: NodeJS.ProcessEnv) => Boolean(env.RESEND_API_KEY && env.ENQUIRY_FROM);

/** Same rule as lib/enquiry/deliver.ts: only an https script.google.com address is trusted. */
function isAppsScriptUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "script.google.com";
  } catch {
    return false;
  }
}
const webhookConfigured = (env: NodeJS.ProcessEnv) => isAppsScriptUrl(env.ENQUIRY_WEBHOOK_URL?.trim() ?? "");

/** Which provider a send would use, or null where none is set. */
export function emailProvider(env: NodeJS.ProcessEnv = process.env): EmailProvider | null {
  if (resendConfigured(env)) return "resend";
  if (webhookConfigured(env)) return "webhook";
  return null;
}

export const emailConfigured = (env: NodeJS.ProcessEnv = process.env) => emailProvider(env) !== null;

/** What a person is told to set when sending is off. */
export const EMAIL_SETUP_HINT =
  "Sending is not configured: set RESEND_API_KEY and ENQUIRY_FROM, or ENQUIRY_WEBHOOK_URL (see docs/SECRETS_CHECKLIST.md).";

function resendPayload(message: Message) {
  return {
    from: process.env.ENQUIRY_FROM,
    to: [message.to],
    subject: message.subject,
    html: message.html,
    text: message.text,
    headers: message.headers,
  };
}

async function post(url: string, body: unknown, headers: Record<string, string> = {}, label: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
    if (!response.ok) console.error(`[email] ${label} failed`, response.status, await response.text());
    return response.ok;
  } catch (error) {
    console.error(`[email] ${label} threw`, error);
    return false;
  }
}

const resendHeaders = () => ({ authorization: `Bearer ${process.env.RESEND_API_KEY}` });

async function viaWebhook(message: Message): Promise<boolean> {
  const url = process.env.ENQUIRY_WEBHOOK_URL?.trim() ?? "";
  const body = {
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    headers: message.headers,
    secret: process.env.ENQUIRY_WEBHOOK_SECRET ?? "",
  };
  return post(url, body, {}, "webhook");
}

/** Sends one message. Resolves false where sending is not configured or the provider refuses. */
export async function sendEmail(message: Message): Promise<boolean> {
  const provider = emailProvider();
  if (provider === "resend") return post(ENDPOINT, resendPayload(message), resendHeaders(), "resend");
  if (provider === "webhook") return viaWebhook(message);
  return false;
}

/** Sends many. Resend takes batches; the webhook takes one at a time. Returns how many were accepted and how many were not. */
export async function sendBatch(messages: Message[]): Promise<{ sent: number; failed: number }> {
  const provider = emailProvider();
  if (!provider || messages.length === 0) return { sent: 0, failed: messages.length };
  let sent = 0;
  let failed = 0;
  if (provider === "webhook") {
    for (const message of messages) {
      if (await viaWebhook(message)) sent += 1;
      else failed += 1;
    }
    return { sent, failed };
  }
  for (let index = 0; index < messages.length; index += BATCH_SIZE) {
    const chunk = messages.slice(index, index + BATCH_SIZE);
    if (await post(BATCH, chunk.map(resendPayload), resendHeaders(), "resend batch")) sent += chunk.length;
    else failed += chunk.length;
  }
  return { sent, failed };
}
