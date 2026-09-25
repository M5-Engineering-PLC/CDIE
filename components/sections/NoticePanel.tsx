// Section. A short page that says what just happened: a confirmed subscription,
// an unsubscribe, or a link that did not work.

import Link from "next/link";

export function NoticePanel({
  eyebrow,
  headline,
  body,
  action,
}: {
  eyebrow: string;
  headline: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <section className="border-b border-line bg-surface">
      <div className="shell band-y flex min-h-[40vh] flex-col justify-center">
        <p className="kicker">{eyebrow}</p>
        <h1 className="display mt-3 max-w-[20ch] text-title md:text-hero">{headline}</h1>
        <p className="mt-4 max-w-[54ch] text-lead leading-relaxed text-ink-2">{body}</p>
        {action ? (
          <p className="mt-8">
            <Link href={action.href} className="bg-brand px-5 py-3 font-medium text-surface no-underline transition-colors hover:bg-brand-live">
              {action.label}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
