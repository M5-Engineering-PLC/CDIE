"use client";

// Admin sign-in and account forms. Internal tooling, not a website surface.
// Review 2026-09-30: "add email input in sign in form as well as create new account option".

import { useActionState } from "react";

import { login, signup } from "@/app/admin/actions";

const input = "border border-line bg-surface px-3 py-2 text-body text-ink";
const label = "flex flex-col gap-1 text-fine text-ink-2";

export function LoginForm({ mode }: { mode: "signin" | "create" }) {
  const [error, action, pending] = useActionState(mode === "create" ? signup : login, null);
  const creating = mode === "create";

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className={label}>
        Email address
        <input name="email" type="email" required autoComplete="username" inputMode="email" className={input} />
      </label>
      <label className={label}>
        Password
        <input
          name="password"
          type="password"
          required
          minLength={creating ? 12 : undefined}
          autoComplete={creating ? "new-password" : "current-password"}
          aria-describedby={creating ? "password-rule" : undefined}
          className={input}
        />
        {creating ? <span id="password-rule" className="text-ink-3">At least 12 characters.</span> : null}
      </label>
      {creating ? (
        <label className={label}>
          Confirm password
          <input name="confirm" type="password" required minLength={12} autoComplete="new-password" className={input} />
        </label>
      ) : null}
      {error ? <p role="alert" className="text-fine text-brand">{error}</p> : null}
      <button type="submit" disabled={pending} className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
        {pending ? (creating ? "Creating…" : "Signing in…") : creating ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
