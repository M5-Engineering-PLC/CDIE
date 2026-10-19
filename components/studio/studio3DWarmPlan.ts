// Lucid: Design Studio virtual tour. Decides how much of the 3D tour a visit may prepare in advance.

/*
  Review 2026-10-19. Plans: "none" fetches nothing, "code" fetches the 3D code
  only, "scenes" also builds the rooms. Data savers, slow links and reduced
  data fetch nothing; devices under 4 GB fetch the code but build nothing.
*/
export type WarmPlan = "none" | "code" | "scenes";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };
type WarmNavigator = Navigator & { connection?: NetworkInformation; deviceMemory?: number };

const SLOW_LINKS = ["slow-2g", "2g", "3g"];

export function studio3DWarmPlan(
  nav: WarmNavigator = navigator,
  query: (media: string) => { matches: boolean } = (media) => window.matchMedia(media),
): WarmPlan {
  const connection = nav.connection;
  if (connection?.saveData) return "none";
  if (SLOW_LINKS.includes(connection?.effectiveType ?? "")) return "none";
  if (query("(prefers-reduced-data: reduce)").matches) return "none";
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return "code";
  return "scenes";
}
