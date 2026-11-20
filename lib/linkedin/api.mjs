import { MAX_POSTS } from "./config.ts";

export const isCoverId = (id) => typeof id === "string" && /^urn:li:(image|video):[\w-]+$/.test(id);

export function linkedInApi(env = process.env) {
  const token = env.LINKEDIN_ACCESS_TOKEN?.trim();
  const organization = env.LINKEDIN_ORGANIZATION_ID?.trim();
  if (!token && !organization) return null;
  const version = env.LINKEDIN_API_VERSION?.trim() || "202611";
  if (!token || !/^\d+$/.test(organization ?? "") || !/^20\d{2}(0[1-9]|1[0-2])$/.test(version)) {
    throw new Error("LinkedIn API requires an access token, numeric organization ID and valid API version");
  }

  const author = `urn:li:organization:${organization}`;
  async function get(path, query, method) {
    const url = new URL(`https://api.linkedin.com/rest/${path}`);
    if (query) url.search = new URLSearchParams(query);
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        "LinkedIn-Version": version,
        "X-Restli-Protocol-Version": "2.0.0",
        ...(method ? { "X-RestLi-Method": method } : {}),
      },
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`LinkedIn API returned HTTP ${response.status}`);
    return response.json();
  }

  return {
    async posts() {
      const { elements } = await get("posts", { q: "author", author, count: String(MAX_POSTS), sortBy: "CREATED" }, "FINDER");
      if (!Array.isArray(elements)) throw new Error("LinkedIn API response has no post list");
      return elements.flatMap((post) => {
        if (post?.author !== author || post.lifecycleState !== "PUBLISHED" || post.visibility !== "PUBLIC"
          || !Number.isFinite(post.publishedAt)) return [];
        const date = new Date(post.publishedAt);
        if (!Number.isFinite(date.getTime())) return [];
        const media = post.content?.media ?? post.content?.multiImage?.images?.[0];
        return [{
          id: post.id,
          postedAt: date.toISOString(),
          text: typeof post.commentary === "string" ? post.commentary.trim() : "",
          title: media?.title ?? post.content?.article?.title,
          repost: Boolean(post.reshareContext),
          mediaId: media?.id ?? post.content?.article?.thumbnail,
        }];
      });
    },
    async cover(mediaId) {
      if (!isCoverId(mediaId)) return null;
      const video = mediaId.startsWith("urn:li:video:");
      const data = await get(`${video ? "videos" : "images"}/${encodeURIComponent(mediaId)}`);
      return { url: video ? data.thumbnail : data.downloadUrl, video };
    },
  };
}
