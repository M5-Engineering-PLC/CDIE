// The page the unsubscribe link in every issue opens.

import type { Metadata } from "next";

import { NoticePanel } from "@/components/sections/NoticePanel";
import { unsubscribe } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Newsletter", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function UnsubscribePage(props: PageProps<"/newsletter/unsubscribe">) {
  const { token } = await props.searchParams;
  const entry = typeof token === "string" && token ? await unsubscribe(token) : null;

  return entry ? (
    <NoticePanel
      eyebrow="Newsletter"
      headline="You have been unsubscribed."
      body={`${entry.email} will not receive the CDIE newsletter again. You can subscribe once more at any time, and the archive stays open to everyone.`}
      action={{ href: "/media#newsletters", label: "Browse the archive" }}
    />
  ) : (
    <NoticePanel
      eyebrow="Newsletter"
      headline="We could not find that subscription."
      body="This unsubscribe link does not match an address on our list, so there may be nothing to remove. Email ive@ku.ac.ke if you keep hearing from us."
      action={{ href: "/contact", label: "Contact the team" }}
    />
  );
}
