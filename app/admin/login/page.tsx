// Admin sign-in. Internal tooling, not a website surface.

import { redirect } from "next/navigation";

import { AdminBar } from "@/components/admin/AdminBar";
import { LoginForm } from "@/components/admin/LoginForm";
import { site } from "@/content/site";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <>
    <AdminBar logo={site.logo} />
    <main className="mx-auto flex max-w-sm flex-col gap-5 p-10">
      <h1 className="text-head text-ink">Sign in</h1>
      {adminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="border-l-2 border-brand-lift bg-raise px-4 py-3 text-body text-ink-2">
          The dashboard is locked because no ADMIN_PASSWORD is set on the server. Set it in the
          environment and restart to enable sign-in.
        </p>
      )}
    </main>
    </>
  );
}
