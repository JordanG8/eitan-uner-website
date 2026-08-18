/**
 * Writes files back into this repository via the GitHub API.
 *
 * This is the production store. The repo Eitan owns *is* the database: page
 * content and uploaded images are committed here, which triggers a Vercel
 * rebuild. Nothing else has to exist — no database, no media service, no extra
 * account to hand over.
 *
 * Everything goes through the Git Data API rather than the simpler Contents
 * API, because Contents writes one file per call and therefore one commit (and
 * one rebuild) per file. Uploading ten photos should be one commit, not ten.
 */

const API = "https://api.github.com";

export interface CommitFile {
  /** Repo-relative path, e.g. "public/uploads/foo.webp". */
  path: string;
  /** Raw bytes, or a UTF-8 string for text files. */
  content: Uint8Array | string;
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export function githubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const slug = process.env.GITHUB_REPO; // "owner/name"
  if (!token || !slug?.includes("/")) return null;
  const [owner, repo] = slug.split("/");
  return {
    token,
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

async function gh<T>(
  cfg: GitHubConfig,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Surface the common misconfigurations in a way that names the fix.
    if (res.status === 401) throw new Error("GitHub rejected the token (401). Check GITHUB_TOKEN.");
    if (res.status === 403) throw new Error("GitHub forbade the write (403). The token needs Contents: read and write on this repo.");
    if (res.status === 404) throw new Error(`GitHub returned 404 for ${path}. Check GITHUB_REPO and GITHUB_BRANCH.`);
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

function toBase64(content: Uint8Array | string): string {
  const bytes =
    typeof content === "string" ? new TextEncoder().encode(content) : content;
  let bin = "";
  const CHUNK = 0x8000; // avoid blowing the argument limit on large images
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

/**
 * Commits a batch of files to the configured branch and returns the commit sha.
 *
 * Read-modify-write against the branch head: if someone else pushed in between,
 * GitHub rejects the ref update rather than silently clobbering their work.
 */
export async function commitFiles(
  files: CommitFile[],
  message: string
): Promise<{ sha: string; url: string }> {
  const cfg = githubConfig();
  if (!cfg) throw new Error("GitHub storage is not configured (GITHUB_TOKEN / GITHUB_REPO).");
  if (!files.length) throw new Error("Nothing to commit.");

  const base = `/repos/${cfg.owner}/${cfg.repo}`;

  // 1. current branch head
  const ref = await gh<{ object: { sha: string } }>(
    cfg,
    `${base}/git/ref/heads/${encodeURIComponent(cfg.branch)}`
  );
  const headSha = ref.object.sha;

  // 2. the tree that commit points at
  const headCommit = await gh<{ tree: { sha: string } }>(
    cfg,
    `${base}/git/commits/${headSha}`
  );

  // 3. upload each file as a blob
  const blobs = await Promise.all(
    files.map(async (file) => {
      const blob = await gh<{ sha: string }>(cfg, `${base}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: toBase64(file.content), encoding: "base64" }),
      });
      return { path: file.path, sha: blob.sha };
    })
  );

  // 4. a tree layered on top of the current one
  const tree = await gh<{ sha: string }>(cfg, `${base}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: headCommit.tree.sha,
      tree: blobs.map((b) => ({
        path: b.path,
        mode: "100644",
        type: "blob",
        sha: b.sha,
      })),
    }),
  });

  // 5. the commit
  const commit = await gh<{ sha: string; html_url: string }>(
    cfg,
    `${base}/git/commits`,
    {
      method: "POST",
      body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] }),
    }
  );

  // 6. move the branch. Not forced — a concurrent push should fail loudly.
  await gh(cfg, `${base}/git/refs/heads/${encodeURIComponent(cfg.branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { sha: commit.sha, url: commit.html_url };
}
