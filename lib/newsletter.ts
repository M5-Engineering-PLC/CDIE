/*
  The newsletter's two emails: the confirmation a new subscriber gets, and the
  issue itself.

  The issue links to the PDF rather than attaching it. The published issues run
  to several megabytes; attaching one costs delivery, and a link lets a reader
  open it on a phone without downloading anything first.

  Every message carries an unsubscribe link, in the body and in the
  List-Unsubscribe header, so a mail client can offer it without the reader
  hunting for it. That is what keeps CDIE out of spam folders.
*/

import { siteUrl } from "@/lib/seo";

import type { Message } from "./email";

const BRAND = "#00508f";
const INK = "#10151a";
const MUTED = "#3d4f5e";

const link = (path: string) => new URL(path, siteUrl).toString();

export const confirmUrl = (token: string) => link(`/newsletter/confirm?token=${token}`);
export const unsubscribeUrl = (token: string) => link(`/newsletter/unsubscribe?token=${token}`);

function shell(body: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f3f5f6;font:16px/1.6 Arial,Helvetica,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #cbd3d6" cellpadding="0" cellspacing="0">
      <tr><td style="padding:28px 28px 8px">${body}</td></tr>
      <tr><td style="padding:16px 28px 28px;border-top:1px solid #e1e6e7;color:${MUTED};font-size:13px">${footer}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;padding:12px 20px;font-weight:bold">${label}</a>`;

/** The double opt-in email. Until its link is opened, nothing else is sent. */
export function confirmationEmail(email: string, token: string): Message {
  const url = confirmUrl(token);
  return {
    to: email,
    subject: "Confirm your CDIE newsletter subscription",
    html: shell(
      `<h1 style="margin:0 0 12px;font-size:22px">One more step</h1>
       <p style="margin:0 0 20px;color:${MUTED}">Confirm this address and we will send you the CDIE newsletter as each issue is published.</p>
       <p style="margin:0 0 20px">${button(url, "Confirm my subscription")}</p>
       <p style="margin:0;color:${MUTED};font-size:14px">If the button does not work, open this link:<br><a href="${url}" style="color:${BRAND}">${url}</a></p>`,
      `You are receiving this because ${email} was entered on the CDIE website. If that was not you, ignore this message and nothing further will be sent.`,
    ),
    text: `Confirm your CDIE newsletter subscription\n\nOpen this link to confirm:\n${url}\n\nIf that was not you, ignore this message and nothing further will be sent.`,
  };
}

export type IssueEmail = {
  issue: string;
  title: string;
  summary: string;
  pdf: string;
  image?: string;
};

/** One issue, to one subscriber. The token makes the unsubscribe link theirs. */
export function issueEmail(email: string, token: string, issue: IssueEmail): Message {
  const stop = unsubscribeUrl(token);
  const pdf = issue.pdf.startsWith("http") ? issue.pdf : link(issue.pdf);
  const cover = issue.image ? (issue.image.startsWith("http") ? issue.image : link(issue.image)) : null;
  return {
    to: email,
    subject: `${issue.issue}: ${issue.title}`,
    headers: { "List-Unsubscribe": `<${stop}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    html: shell(
      `${cover ? `<img src="${cover}" alt="" width="504" style="display:block;width:100%;height:auto;margin:0 0 20px">` : ""}
       <p style="margin:0 0 6px;color:${BRAND};font-size:13px;letter-spacing:.12em;text-transform:uppercase">${issue.issue}</p>
       <h1 style="margin:0 0 12px;font-size:22px">${issue.title}</h1>
       <p style="margin:0 0 20px;color:${MUTED}">${issue.summary}</p>
       <p style="margin:0 0 8px">${button(pdf, "Read the issue")}</p>
       <p style="margin:0;color:${MUTED};font-size:14px">Opens the PDF in your browser.</p>`,
      `You are receiving this because you subscribed to the CDIE newsletter. <a href="${stop}" style="color:${MUTED}">Unsubscribe</a>.`,
    ),
    text: `${issue.issue}: ${issue.title}\n\n${issue.summary}\n\nRead the issue: ${pdf}\n\nUnsubscribe: ${stop}`,
  };
}
