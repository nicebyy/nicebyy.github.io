/**
 * Operator Authentication & Persistent Session Manager
 * Dedicated to blog operator (kimkkatta / nicebyy).
 * Prevents unauthorized visitors from accessing editing, writing, hiding, or deleting capabilities.
 */

import { DEFAULT_REPO, DEFAULT_BRANCH, saveStoredGitHubConfig } from "./github-api";

export interface OperatorSession {
  token: string;
  username: string;       // GitHub username (e.g., "nicebyy")
  displayName: string;    // Blog author nickname (e.g., "kimkkatta")
  repo: string;           // "nicebyy/nicebyy.github.io"
  branch: string;         // "develop" or "main"
  avatarUrl?: string;
  authenticatedAt: number;
}

export const AUTH_SESSION_KEY = "cyber_operator_session";
export const AUTH_EVENT_NAME = "operator-auth-changed";

/**
 * Retrieve active Operator session from browser storage
 */
export function getOperatorSession(): OperatorSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as OperatorSession;
    if (!session.token || !session.username) return null;
    return session;
  } catch {
    return null;
  }
}

/**
 * Check if the active client is authenticated as the blog operator
 */
export function isOperatorAuthenticated(): boolean {
  return getOperatorSession() !== null;
}

/**
 * Save authenticated Operator session
 */
export function saveOperatorSession(session: OperatorSession): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));

  // Sync with github-api config keys
  saveStoredGitHubConfig({
    token: session.token,
    repo: session.repo,
    branch: session.branch,
  });

  window.dispatchEvent(
    new CustomEvent(AUTH_EVENT_NAME, { detail: session })
  );
}

/**
 * Destroy active Operator session (Logout)
 */
export function clearOperatorSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_SESSION_KEY);
  saveStoredGitHubConfig({ token: "" });

  window.dispatchEvent(
    new CustomEvent(AUTH_EVENT_NAME, { detail: null })
  );
}

/**
 * Verify credentials with GitHub API and establish Operator session
 */
export async function authenticateOperator(
  token: string,
  branch: string = DEFAULT_BRANCH,
  repo: string = DEFAULT_REPO
): Promise<{
  success: boolean;
  session?: OperatorSession;
  error?: string;
}> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { success: false, error: "운영자 액세스 토큰(PAT)을 입력해주세요." };
  }

  try {
    // 1. Fetch user profile from GitHub API
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${cleanToken}`,
      },
    });

    if (!userRes.ok) {
      if (userRes.status === 401) {
        return {
          success: false,
          error: "유효하지 않거나 만료된 토큰입니다. 올바른 액세스 키를 확인해주세요 (401 Unauthorized).",
        };
      }
      return {
        success: false,
        error: `GitHub 사용자 인증 실패 (${userRes.status}): ${userRes.statusText}`,
      };
    }

    const userData = await userRes.json();
    const username = userData.login;

    // 2. Verify push/write permissions on the target repository
    const repoRes = await fetch(`https://api.github.com/repos/${repo.trim()}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${cleanToken}`,
      },
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return {
          success: false,
          error: `저장소 '${repo}'에 접근할 수 없습니다. 권한이 없거나 저장소가 존재하지 않습니다.`,
        };
      }
      return {
        success: false,
        error: `저장소 권한 확인 오류 (${repoRes.status}): ${repoRes.statusText}`,
      };
    }

    const repoData = await repoRes.json();
    const canPush = Boolean(repoData.permissions?.push);

    if (!canPush) {
      return {
        success: false,
        error: `계정 '${username}'은 저장소에 대한 쓰기/푸시(Push) 권한이 없습니다. 블로그 소유자(운영자) 계정으로 인증해주세요.`,
      };
    }

    // 3. Assemble and persist Operator Session
    const session: OperatorSession = {
      token: cleanToken,
      username,
      displayName: "kimkkatta",
      repo: repo.trim(),
      branch: branch.trim(),
      avatarUrl: userData.avatar_url,
      authenticatedAt: Date.now(),
    };

    saveOperatorSession(session);

    return {
      success: true,
      session,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `인증 네트워크 통신 오류: ${message}`,
    };
  }
}
