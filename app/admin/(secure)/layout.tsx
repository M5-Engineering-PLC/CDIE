// Everything under here needs a signed-in admin. Internal tooling, not a website surface.

import { logout } from "@/app/admin/actions";
import { AdminBar } from "@/components/admin/AdminBar";
import { site } from "@/content/site";
import { AUTH_ENABLED, requireAdmin } from "@/lib/admin/auth";
import { collections } from "@/lib/admin/collections";

export default async function SecureLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <>
      <AdminBar
        logo={site.logo}
        links={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/studio", label: "Design Studio" },
          { href: "/admin/models/design-studio", label: "Studio model" },
          { href: "/admin/models/atc", label: "ATC model" },
          ...collections.map((collection) => ({ href: `/admin/${collection.id}`, label: collection.label })),
        ]}
        signOut={AUTH_ENABLED ? (
          <form action={logout}>
            <button type="submit" className="text-fine font-medium text-brand hover:text-brand-live">Sign out</button>
          </form>
        ) : null}
      />
      {children}
    </>
  );
}
