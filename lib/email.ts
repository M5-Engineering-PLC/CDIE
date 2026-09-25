/*
  Sending email through Resend, shared by the enquiry route and the newsletter.

  The same two variables the enquiry route already uses:
    RESEND_API_KEY   the API key
    ENQUIRY_FROM     a sender on a domain verified with Resend

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

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_FROM);

function payload(message: Message) {
  return {
    from: process.env.ENQUIRY_FROM,
    to: [message.to],
    subject: message.subject,
    html: message.html,
    text: message.text,
    headers: message.headers,
  };
}

/** Sends one message. Resolves false where sending is not configured or the API refuses. */
export async function sendEmail(message: Message): Promise<boolean> {
  if (!emailConfigured()) return false;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify(payload(message)),
    });
    if (!response.ok) console.error("[email] send failed", response.status, await response.text());
    return response.ok;
  } catch (error) {
    console.error("[email] send threw", error);
    return false;
  }
}

/** Sends many, in batches. Returns how many the API accepted and how many it did not. */
export async function sendBatch(messages: Message[]): Promise<{ sent: number; failed: number }> {
  if (!emailConfigured() || messages.length === 0) return { sent: 0, failed: messages.length };
  let sent = 0;
  let failed = 0;
  for (let index = 0; index < messages.length; index += BATCH_SIZE) {
    const chunk = messages.slice(index, index + BATCH_SIZE);
    try {
      const response = await fetch(BATCH, {
        method: "POST",
        headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify(chunk.map(payload)),
      });
      if (response.ok) {
        sent += chunk.length;
      } else {
        failed += chunk.length;
        console.error("[email] batch failed", response.status, await response.text());
      }
    } catch (error) {
      failed += chunk.length;
      console.error("[email] batch threw", error);
    }
  }
  return { sent, failed };
}
