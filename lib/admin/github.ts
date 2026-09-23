/*
  The dashboard's line to GitHub.

  Final pass 2026-09-23: "any new post, media or element added through the
  dashboard uploads the details to the google sheets spreadsheet. GitHub
  fetches the latest data concerning each element to be displayed".

  Two jobs, both optional and both best-effort:
  - notifyContentChanged() fires a repository_dispatch event so
    .github/workflows/sync-cms.yml pulls the sheet into content/cms-snapshot.json
    straight away rather than waiting for its hourly run.
  - commitUpload() files an uploaded photograph or PDF under public/uploads in
    the repository, because a serverless host has no disk that outlives the
    request. /api/uploads serves it from there until the next deploy.

  Environment: GITHUB_REPO as owner/name, GITHUB_TOKEN a fine-grained token on
  that repository with Contents read and write. Unset, both are no-ops.
*/

const API = "https://api.github.com";

function config() {
  const repo = process.env.GITHUB_REPO?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();
  return repo && token && /^[\w.-]+\/[\w.-]+$/.test(repo) ? { repo, token } : null;
}

export const githubConfigured = () => config() !== null;

const headers = (token: string) => ({
  authorization: `Bearer ${token}`,
  accept: "application/vnd.github+json",
  "x-github-api-version": "2022-11-28",
});

export async function notifyContentChanged(reason: string): Promise<void> {
  const gh = config();
  if (!gh) return;
  try {
    const response = await fetch(`${API}/repos/${gh.repo}/dispatches`, {
      method: "POST",
      headers: headers(gh.token),
      body: JSON.stringify({ event_type: "cms-updated", client_payload: { reason } }),
      cache: "no-store",
    });
    if (!response.ok) console.error("[admin] GitHub dispatch failed", response.status, await response.text());
  } catch (error) {
    console.error("[admin] GitHub dispatch failed", error);
  }
}

export const UPLOAD_DIR = "public/uploads";

export async function commitUpload(name: string, body: Buffer): Promise<boolean> {
  const gh = config();
  if (!gh) return false;
  const response = await fetch(`${API}/repos/${gh.repo}/contents/${UPLOAD_DIR}/${name}`, {
    method: "PUT",
    headers: headers(gh.token),
    body: JSON.stringify({ message: `Dashboard upload ${name}`, content: body.toString("base64") }),
    cache: "no-store",
  });
  if (!response.ok) console.error("[admin] GitHub upload failed", response.status, await response.text());
  return response.ok;
}

/** Reads a committed upload back through the API, for the window before the next deploy ships it. */
export async function readCommittedUpload(name: string): Promise<ArrayBuffer | null> {
  const gh = config();
  if (!gh) return null;
  const response = await fetch(`${API}/repos/${gh.repo}/contents/${UPLOAD_DIR}/${name}`, {
    headers: { ...headers(gh.token), accept: "application/vnd.github.raw+json" },
    cache: "no-store",
  });
  return response.ok ? response.arrayBuffer() : null;
}
