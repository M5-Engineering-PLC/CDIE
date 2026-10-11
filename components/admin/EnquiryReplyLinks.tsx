"use client";

/* Source: Fix plan 2026-10-11, D5, dashboard enquiry reply links. */

import { useState } from "react";
import { buildReplyUrls } from "@/lib/enquiry/reply-links.mjs";

export function EnquiryReplyLinks({ email, message }: { email: string; message: string }) {
  const [copied, setCopied] = useState(false);
  const urls = buildReplyUrls(email, message);
  async function copyAddress() {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-brand">
      <a href={`mailto:${email}`} className="underline">{email}</a>
      <a href={urls.gmail} target="_blank" rel="noopener noreferrer" className="underline">Reply in Gmail</a>
      <a href={urls.outlook} target="_blank" rel="noopener noreferrer" className="underline">Reply in Outlook</a>
      <button type="button" onClick={copyAddress} className="underline">{copied ? "Copied" : "Copy address"}</button>
    </div>
  );
}
