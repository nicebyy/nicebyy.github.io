/**
 * GitHub REST API Client for kimkkatta DEV.LOG Studio
 * Handles direct browser-to-GitHub commits, file updates, and deletions.
 */

export interface GitHubConfig {
  token: string;
  repo: string;
  branch: string;
}

const STORAGE_KEY_TOKEN = "cyber_studio_github_token";
const STORAGE_KEY_REPO = "cyber_studio_github_repo";
const STORAGE_KEY_BRANCH = "cyber_studio_github_branch";

export const DEFAULT_REPO = "nicebyy/nicebyy.github.io";
export const DEFAULT_BRANCH = "main";

export function getStoredGitHubConfig(): GitHubConfig {
  if (typeof window === "undefined") {
    return { token: "", repo: DEFAULT_REPO, branch: DEFAULT_BRANCH };
  }

  const token = localStorage.getItem(STORAGE_KEY_TOKEN) || "";
  const repo = localStorage.getItem(STORAGE_KEY_REPO) || DEFAULT_REPO;
  const branch = localStorage.getItem(STORAGE_KEY_BRANCH) || DEFAULT_BRANCH;

  return { token, repo, branch };
}

export function saveStoredGitHubConfig(config: Partial<GitHubConfig>): void {
  if (typeof window === "undefined") return;

  if (config.token !== undefined) {
    if (config.token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, config.token.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }

  if (config.repo !== undefined) {
    localStorage.setItem(STORAGE_KEY_REPO, config.repo.trim() || DEFAULT_REPO);
  }

  if (config.branch !== undefined) {
    localStorage.setItem(STORAGE_KEY_BRANCH, config.branch.trim() || DEFAULT_BRANCH);
  }
}

/**
 * UTF-8 safe base64 encoding for browser environment
 */
export function utf8ToBase64(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch {
    return Buffer.from(str, "utf-8").toString("base64");
  }
}

/**
 * UTF-8 safe base64 decoding for browser environment
 */
export function base64ToUtf8(base64: string): string {
  try {
    const cleanBase64 = base64.replace(/\s+/g, "");
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(cleanBase64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return Buffer.from(base64, "base64").toString("utf-8");
  }
}

/**
 * Test connectivity with GitHub repository using the supplied token
 */
export async function testGitHubConnection(token: string, repo: string = DEFAULT_REPO): Promise<{
  success: boolean;
  user?: string;
  repoName?: string;
  permissions?: { push: boolean; admin: boolean };
  error?: string;
}> {
  if (!token.trim()) {
    return { success: false, error: "GitHub 개인 액세스 토큰(PAT)을 입력해주세요." };
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${token.trim()}`,
    };

    const res = await fetch(`https://api.github.com/repos/${repo.trim()}`, { headers });

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, error: "토큰이 유효하지 않거나 만료되었습니다 (401 Unauthorized)." };
      }
      if (res.status === 404) {
        return {
          success: false,
          error: `저장소 '${repo}'를 찾을 수 없거나 토큰에 접근 권한이 없습니다 (404 Not Found).`,
        };
      }
      return { success: false, error: `GitHub API 오류 (${res.status}): ${res.statusText}` };
    }

    const data = await res.json();
    return {
      success: true,
      user: data.owner?.login || "Authorized User",
      repoName: data.full_name,
      permissions: data.permissions,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `네트워크 연결 실패: ${message}` };
  }
}

/**
 * Fetch file metadata (SHA and raw content) from GitHub
 */
export async function getGitHubFile(
  path: string,
  options?: { token?: string; repo?: string; branch?: string }
): Promise<{ sha: string; rawContent: string } | null> {
  const token = options?.token || getStoredGitHubConfig().token;
  const repo = options?.repo || getStoredGitHubConfig().repo;
  const branch = options?.branch || getStoredGitHubConfig().branch;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  try {
    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`GitHub get file error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    const rawContent = data.content ? base64ToUtf8(data.content) : "";

    return {
      sha: data.sha,
      rawContent,
    };
  } catch (err) {
    console.warn(`Failed to get file ${path} from GitHub:`, err);
    return null;
  }
}

/**
 * Create or update a file on GitHub repository
 */
export async function commitGitHubFile(params: {
  path: string;
  content: string;
  message: string;
  token?: string;
  repo?: string;
  branch?: string;
  sha?: string;
}): Promise<{ success: boolean; sha?: string; htmlUrl?: string; error?: string }> {
  const token = params.token || getStoredGitHubConfig().token;
  const repo = params.repo || getStoredGitHubConfig().repo;
  const branch = params.branch || getStoredGitHubConfig().branch;

  if (!token.trim()) {
    return { success: false, error: "GitHub 토큰이 설정되지 않았습니다. 우측 상단 GitHub 설정을 완료해주세요." };
  }

  try {
    // If sha wasn't provided, try to fetch current SHA to prevent edit collisions
    let fileSha = params.sha;
    if (!fileSha) {
      const existing = await getGitHubFile(params.path, { token, repo, branch });
      if (existing) {
        fileSha = existing.sha;
      }
    }

    const base64Content = utf8ToBase64(params.content);
    const body: Record<string, any> = {
      message: params.message,
      content: base64Content,
      branch: branch,
    };

    if (fileSha) {
      body.sha = fileSha;
    }

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${params.path}`, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const detail = errJson?.message || res.statusText;
      return { success: false, error: `GitHub 커밋 실패 (${res.status}): ${detail}` };
    }

    const data = await res.json();
    return {
      success: true,
      sha: data.content?.sha,
      htmlUrl: data.commit?.html_url,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `커밋 요청 오류: ${message}` };
  }
}

/**
 * Delete a file on GitHub repository
 */
export async function deleteGitHubFile(params: {
  path: string;
  sha: string;
  message: string;
  token?: string;
  repo?: string;
  branch?: string;
}): Promise<{ success: boolean; error?: string }> {
  const token = params.token || getStoredGitHubConfig().token;
  const repo = params.repo || getStoredGitHubConfig().repo;
  const branch = params.branch || getStoredGitHubConfig().branch;

  if (!token.trim()) {
    return { success: false, error: "GitHub 토큰이 필요합니다. 설정을 완료해주세요." };
  }

  try {
    let fileSha = params.sha;
    if (!fileSha) {
      const existing = await getGitHubFile(params.path, { token, repo, branch });
      if (!existing) {
        return { success: false, error: "삭제할 파일이 원격 저장소에 존재하지 않습니다." };
      }
      fileSha = existing.sha;
    }

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${params.path}`, {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: params.message,
        sha: fileSha,
        branch: branch,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const detail = errJson?.message || res.statusText;
      return { success: false, error: `GitHub 파일 삭제 실패 (${res.status}): ${detail}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `삭제 요청 오류: ${message}` };
  }
}
