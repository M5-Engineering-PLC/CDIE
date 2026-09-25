import Link from "next/link";

import { AtcLab } from "@/components/admin/AtcLab";

export const dynamic = "force-dynamic";

export default function AtcLabPage() {
  return (
    <main className="mx-auto flex max-w-[96rem] flex-col gap-6 p-6 md:p-10">
      <header className="flex flex-col gap-3">
        <Link href="/admin/labs" className="text-fine font-medium text-brand hover:underline">
          ← All labs
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <p className="kicker">Review build · ATC</p>
          <span className="border border-line px-2 py-1 font-mono text-[0.625rem] uppercase tracking-wider text-brand">
            Not embedded
          </span>
        </div>
        <h1 className="text-head text-ink">ATC Workshop Lab</h1>
        <p className="max-w-[68ch] text-body leading-relaxed text-ink-2">
          Explore the workshop model and its layout before the ATC build moves into the public Design Studio.
        </p>
      </header>

      <AtcLab />
    </main>
  );
}
