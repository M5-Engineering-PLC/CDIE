// Lucid: Global nav, logo. Five quick clicks on the logo open the admin dashboard.
/*
  Request 2026-10-01: a quiet way in for staff. The dashboard has its own sign
  in, so a visitor who stumbles on it reaches only the login screen. Clicks one
  to four behave as the home link always has; the fifth, within the window,
  opens the dashboard in a new tab instead.
*/

import { useRef, type MouseEvent } from "react";

const CLICKS = 5;
const WINDOW_MS = 2000;

export function useAdminEasterEgg(href = "/admin") {
  const clicks = useRef<number[]>([]);
  return (event: MouseEvent) => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((at) => now - at < WINDOW_MS), now];
    if (clicks.current.length < CLICKS) return;
    clicks.current = [];
    event.preventDefault();
    window.open(href, "_blank", "noopener");
  };
}
