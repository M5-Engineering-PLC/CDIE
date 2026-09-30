// Admin sign-in and account creation. Internal tooling, not a website surface.

import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminBar } from "@/components/admin/AdminBar";
import { LoginForm } from "@/components/admin/LoginForm";
import { site } from "@/content/site";
import { adminConfigured, isAdmin, signupOpen } from "@/lib/admin/auth";

export default async function AdminLoginPage(props: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const creating = (await props.searchParams).create === "1" && signupOpen();

  return (
    <>
    <AdminBar logo={site.logo} />
    <main className="mx-auto flex max-w-sm flex-col gap-5 p-10">
      <h1 className="text-head text-ink">{creating ? "Create an account" : "Sign in"}</h1>
      {adminConfigured() ? (
        <>
          {creating ? (
            <p className="text-fine text-ink-3">Accounts are open to the addresses the site administrator has approved.</p>
          ) : null}
          <LoginForm key={creating ? "create" : "signin"} mode={creating ? "create" : "signin"} />
          {signupOpen() ? (
            <p className="text-fine text-ink-2">
              {creating ? "Already have an account? " : "No account yet? "}
              <Link href={creating ? "/admin/login" : "/admin/login?create=1"} className="font-medium text-brand hover:text-brand-live">
                {creating ? "Sign in" : "Create an account"}
              </Link>
            </p>
          ) : null}
        </>
      ) : (
        <p className="border-l-2 border-brand-lift bg-raise px-4 py-3 text-body text-ink-2">
          The dashboard is locked because sign-in is not set up on the server. Set ADMIN_SECRET and either
          ADMIN_PASSWORD or ADMIN_EMAILS in the environment and restart.
        </p>
      )}
    </main>
    </>
  );
}
