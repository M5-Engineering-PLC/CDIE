// Everything under here needs a signed-in admin. Internal tooling, not a website surface.

import { logout } from "@/app/admin/actions";
import { AdminBar } from "@/components/admin/AdminBar";
import { site } from "@/content/site";
import { AUTH_ENABLED, currentAdmin, requireAdmin } from "@/lib/admin/auth";
import { dashboardCollections } from "@/lib/admin/collections";

export default async function SecureLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const who = AUTH_ENABLED ? await currentAdmin() : null;

  return (
    <>
      <AdminBar
        logo={site.logo}
        links={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/studio", label: "Design Studio" },
          // Review 2026-09-30: Labs, Posts and Upcoming activities leave the bar.
          ...dashboardCollections.map((collection) => ({ href: `/admin/${collection.id}`, label: collection.label })),
        ]}
        signOut={AUTH_ENABLED ? (
          <form action={logout} className="flex items-center gap-3">
            {who ? <span className="text-fine text-ink-3">{who}</span> : null}
            <button type="submit" className="text-fine font-medium text-brand hover:text-brand-live">Sign out</button>
          </form>
        ) : null}
      />
      {children}
    </>
  );
}
