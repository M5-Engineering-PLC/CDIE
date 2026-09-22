// Everything under here needs a signed-in admin. Internal tooling, not a website surface.

import Link from "next/link";

import { logout } from "@/app/admin/actions";
import { AUTH_ENABLED, requireAdmin } from "@/lib/admin/auth";
import { collections } from "@/lib/admin/collections";

export default async function SecureLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <>
      <nav aria-label="Dashboard" className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-6 py-3">
        <Link href="/admin" className="text-fine text-ink-2 hover:text-brand">Overview</Link>
        {collections.map((collection) => (
          <Link key={collection.id} href={`/admin/${collection.id}`} className="text-fine text-ink-2 hover:text-brand">
            {collection.label}
          </Link>
        ))}
        {AUTH_ENABLED ? (
          <form action={logout} className="ml-auto">
            <button type="submit" className="text-fine font-medium text-brand hover:text-brand-live">Sign out</button>
          </form>
        ) : null}
      </nav>
      {children}
    </>
  );
}
