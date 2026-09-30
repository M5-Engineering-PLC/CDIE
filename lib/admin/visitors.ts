/*
  Review 2026-09-30: "pull visitors analytics from vercel and display".

  Vercel Web Analytics has a public query API (docs: vercel.com/docs/analytics/
  web-analytics-api). Three reads, cached for fifteen minutes so the dashboard
  does not spend the API's allowance on every visit:
  - visits/count over the last 30 days: exact visitors and page views;
  - visits/aggregate by day over the last 14 days: the trend;
  - visits/aggregate by requestPath over the last 30 days: the top pages.

  The site collects the data through @vercel/analytics (components/chrome/
  SiteAnalytics.tsx) on public pages only. Web Analytics must also be switched
  on for the project in the Vercel dashboard.

  Environment, all on the server only:
    VERCEL_ANALYTICS_TOKEN       a Vercel access token that can read the project
    VERCEL_ANALYTICS_PROJECT_ID  the project id (prj_...) or name
    VERCEL_ANALYTICS_TEAM_ID     the team id (team_...), for a team project
*/

const API = "https://api.vercel.com/v1/query/web-analytics/visits";
const DAY_MS = 24 * 60 * 60 * 1000;

export type VisitorReport = {
  visitors: number;
  pageviews: number;
  days: { label: string; value: number }[];
  pages: { path: string; pageviews: number; visitors: number }[];
};

const settings = () => {
  const token = process.env.VERCEL_ANALYTICS_TOKEN?.trim();
  const projectId = process.env.VERCEL_ANALYTICS_PROJECT_ID?.trim();
  return token && projectId ? { token, projectId, teamId: process.env.VERCEL_ANALYTICS_TEAM_ID?.trim() } : null;
};

export const visitorsConfigured = () => settings() !== null;

const day = (offset: number) => new Date(Date.now() - offset * DAY_MS).toISOString().slice(0, 10);

async function query<T>(path: string, params: Record<string, string>): Promise<T> {
  const config = settings();
  if (!config) throw new Error("not configured");
  const search = new URLSearchParams({ projectId: config.projectId, ...(config.teamId ? { teamId: config.teamId } : {}), ...params });
  const response = await fetch(`${API}/${path}?${search}`, {
    headers: { Authorization: `Bearer ${config.token}` },
    next: { revalidate: 900 },
  });
  if (!response.ok) throw new Error(`Vercel analytics ${path} answered ${response.status}`);
  return ((await response.json()) as { data: T }).data;
}

/** Null when not configured; an error string when Vercel could not be read. */
export async function readVisitors(): Promise<VisitorReport | string | null> {
  if (!visitorsConfigured()) return null;
  try {
    const [total, daily, pages] = await Promise.all([
      query<{ visitors: number; pageviews: number }>("count", { since: day(29), until: day(0) }),
      query<{ timestamp: string; visitors: number }[]>("aggregate", { since: day(13), until: day(0), by: "day" }),
      query<{ requestPath: string; pageviews: number; visitors: number }[]>("aggregate", { since: day(29), until: day(0), by: "requestPath", limit: "6" }),
    ]);
    return {
      visitors: total.visitors,
      pageviews: total.pageviews,
      days: daily.map((row) => ({
        label: new Date(row.timestamp).toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" }),
        value: row.visitors,
      })),
      pages: pages.filter((row) => row.requestPath !== "Others").map(({ requestPath, pageviews, visitors }) => ({ path: requestPath, pageviews, visitors })),
    };
  } catch (error) {
    console.error("[admin] visitor analytics", error);
    return "Vercel analytics could not be read just now. The server log has the reason.";
  }
}
