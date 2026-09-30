"use client";

// Chrome. Review 2026-09-30: "pull visitors analytics from vercel". The collector for Vercel Web Analytics.
/*
  Mounted in the public site's layout only, so the dashboard is never counted
  as a visitor. Vercel Web Analytics sets no cookies and keeps no personal
  identifiers; the dashboard reads the totals back through lib/admin/visitors.ts.
  Nothing is sent until Web Analytics is switched on for the project in Vercel.
*/

import { Analytics } from "@vercel/analytics/next";

export function SiteAnalytics() {
  return <Analytics />;
}
