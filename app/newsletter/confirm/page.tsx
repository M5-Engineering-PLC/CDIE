// The page the confirmation link in the sign-up email opens.

import type { Metadata } from "next";

import { NoticePanel } from "@/components/sections/NoticePanel";
import { confirmSubscription } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Newsletter", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConfirmPage(props: PageProps<"/newsletter/confirm">) {
  const { token } = await props.searchParams;
  const entry = typeof token === "string" && token ? await confirmSubscription(token) : null;

  return entry ? (
    <NoticePanel
      eyebrow="Newsletter"
      headline="You are on the list."
      body={`${entry.email} is confirmed. The next issue of the CDIE newsletter will arrive by email, and every issue carries a link to unsubscribe.`}
      action={{ href: "/media#newsletters", label: "Read the latest issue" }}
    />
  ) : (
    <NoticePanel
      eyebrow="Newsletter"
      headline="That link has expired."
      body="We could not match this confirmation link to a sign-up. It may already have been used. Enter your address again and we will send a fresh one."
      action={{ href: "/media#newsletters", label: "Back to newsletters" }}
    />
  );
}
