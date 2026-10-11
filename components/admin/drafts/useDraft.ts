"use client";

// Dashboard drafts: the hook every page that drafts changes shares. Internal tooling.
/*
  Fix plan 2026-10-11, D7: changes are drafted in the page and nothing is
  published until the editor reviews and saves them. The draft is kept in
  this browser per page, so an accidental reload does not lose it; nobody else
  sees it. Leaving the page with a draft asks first, whether by closing the
  tab or following a dashboard link.
*/

import { useEffect, useState } from "react";

type Options<T> = {
  empty: T;
  isEmpty: (draft: T) => boolean;
  /** What of the draft is kept in the browser. */
  persist: (draft: T) => unknown;
  /** Rebuilds a kept draft, or null if it no longer applies. Pass a stable function (useCallback). */
  restore: (saved: unknown) => T | null;
};

const LEAVE = "Your changes are not saved yet. Leave this page anyway?";

function keep(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A browser with site data blocked keeps the draft only until the page closes.
  }
}

export function useDraft<T>(page: string, { empty, isEmpty, persist, restore }: Options<T>) {
  const key = `cdie-draft:${page}`;
  const [draft, setDraft] = useState<T>(empty);

  useEffect(() => {
    // After paint: the server renders the saved state, and a kept draft is laid over it once the browser answers.
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(key);
        const saved = raw ? restore(JSON.parse(raw)) : null;
        if (saved) setDraft(saved);
      } catch {
        // Nothing kept, or nothing readable: start clean.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [key, restore]);

  const dirty = !isEmpty(draft);
  useLeaveGuard(dirty);

  const change = (next: T) => {
    setDraft(next);
    keep(key, isEmpty(next) ? null : persist(next));
  };

  return { draft, change, clear: () => change(empty), dirty };
}

function useLeaveGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    // Capture phase, so the question comes before the client router follows the link.
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;
      if (link.origin === location.origin && link.pathname === location.pathname && link.search === location.search) return;
      if (!window.confirm(LEAVE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const submit = (event: SubmitEvent) => {
      if (event.target instanceof HTMLFormElement && event.target.hasAttribute("data-draft-leave") && !window.confirm(LEAVE)) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    document.addEventListener("submit", submit, true);
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      document.removeEventListener("submit", submit, true);
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [active]);
}
