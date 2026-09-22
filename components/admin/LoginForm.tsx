"use client";

// Admin sign-in form. Internal tooling, not a website surface.

import { useActionState } from "react";

import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-fine text-ink-2">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="border border-line bg-surface px-3 py-2 text-body text-ink"
        />
      </label>
      {error ? <p role="alert" className="text-fine text-brand">{error}</p> : null}
      <button type="submit" disabled={pending} className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
