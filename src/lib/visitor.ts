export interface VisitorHistoryItem {
  hit_count: number;
  hit_date: string;
  is_today: number;
}

export interface VisitorStats {
  todayHits: number;
  totalHits: number;
  history: VisitorHistoryItem[];
  source: "live" | "cached" | "error";
  isLocalPreview: boolean;
}

const SESSION_KEY = "kimkkatta_visitor_counted_date_v1";
const CACHE_KEY = "kimkkatta_visitor_cache_v1";
const REQUEST_TIMEOUT_MS = 6000;

let inFlightRequests = new Map<string, Promise<VisitorStats>>();
let memoryCache = new Map<string, VisitorStats>();

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function safeGetStorage(storage: Storage | undefined, key: string): string | null {
  try {
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSetStorage(storage: Storage | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

function readCachedStats(isLocalPreview: boolean): VisitorStats | null {
  const raw = safeGetStorage(window.localStorage, CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      todayHits?: unknown;
      totalHits?: unknown;
      history?: unknown;
      date?: unknown;
    };
    if (typeof parsed.totalHits !== "number" || typeof parsed.todayHits !== "number") {
      return null;
    }
    const todayStr = getLocalDateString();
    return {
      todayHits: parsed.date === todayStr ? parsed.todayHits : 0,
      totalHits: parsed.totalHits,
      history: Array.isArray(parsed.history) ? (parsed.history as VisitorHistoryItem[]) : [],
      source: "cached",
      isLocalPreview,
    };
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Fetches site visitor stats (today & total) via hitscounter.dev.
 * Uses a module-level singleton per targetUrl so multiple mounted components
 * share a single HTTP request, and avoids inflating production hits in local dev
 * or on repeated SPA navigations within the same day's session.
 */
export async function fetchVisitorStats(targetUrl: string): Promise<VisitorStats> {
  if (typeof window === "undefined") {
    return {
      todayHits: 0,
      totalHits: 0,
      history: [],
      source: "error",
      isLocalPreview: false,
    };
  }

  const cachedInMemory = memoryCache.get(targetUrl);
  if (cachedInMemory) {
    return cachedInMemory;
  }

  const existing = inFlightRequests.get(targetUrl);
  if (existing) {
    return existing;
  }

  const promise = (async (): Promise<VisitorStats> => {
    const host = window.location.hostname;
    const isLocalPreview =
      host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "";
    const todayStr = getLocalDateString();
    const countedDate = safeGetStorage(window.sessionStorage, SESSION_KEY);
    const shouldIncrement = !isLocalPreview && countedDate !== todayStr;

    const encodedUrl = encodeURIComponent(targetUrl);
    const endpoint = shouldIncrement
      ? `https://hitscounter.dev/api/hit?url=${encodedUrl}&output=json`
      : `https://hitscounter.dev/api/history?url=${encodedUrl}`;

    try {
      const res = await fetchWithTimeout(endpoint);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        today_hits?: unknown;
        total_hits?: unknown;
        history?: unknown;
      };

      const todayHits = typeof data.today_hits === "number" ? data.today_hits : 0;
      const totalHits = typeof data.total_hits === "number" ? data.total_hits : 0;
      const history = Array.isArray(data.history)
        ? (data.history as VisitorHistoryItem[])
        : [];

      if (shouldIncrement) {
        safeSetStorage(window.sessionStorage, SESSION_KEY, todayStr);
      }

      const stats: VisitorStats = {
        todayHits,
        totalHits,
        history,
        source: "live",
        isLocalPreview,
      };

      safeSetStorage(
        window.localStorage,
        CACHE_KEY,
        JSON.stringify({
          todayHits,
          totalHits,
          history,
          date: todayStr,
        })
      );

      memoryCache.set(targetUrl, stats);
      return stats;
    } catch {
      const fallback = readCachedStats(isLocalPreview);
      if (fallback) {
        memoryCache.set(targetUrl, fallback);
        return fallback;
      }
      return {
        todayHits: 0,
        totalHits: 0,
        history: [],
        source: "error",
        isLocalPreview,
      };
    } finally {
      inFlightRequests.delete(targetUrl);
    }
  })();

  inFlightRequests.set(targetUrl, promise);
  return promise;
}

export function formatCompactCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}
