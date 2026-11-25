/**
 * Server-side fetch helper for pages that render API content.
 *
 * Why this exists: pages are cached and regenerated in the background (ISR). If the API
 * has a hiccup and a page "handles" it by returning an empty list, that EMPTY page becomes
 * the new cached version and replaces the good one. So instead:
 *   - 404            -> returns null  (the item genuinely doesn't exist)
 *   - any other fail -> throws        (Next keeps serving the last good page and retries later)
 *
 * While `next build` runs, a failure would abort the whole deploy, and on the shared host the
 * API is often briefly unreachable at exactly that moment (it restarts and the host's protection
 * can answer 403/429/5xx while three apps build at once). So during the build only, a failed
 * call is retried a few times with a growing pause. If the API is still failing after the last
 * try it throws as before: the build fails and the previous version of the site stays live.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const RETRYABLE_STATUSES = new Set([403, 408, 425, 429, 500, 502, 503, 504]);
const BUILD_RETRY_DELAYS_MS = [3000, 6000, 12000, 20000];

const isBuildPhase = () => process.env.NEXT_PHASE === 'phase-production-build';
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function apiFetch<T>(path: string, revalidate: number): Promise<T | null> {
  const delays = isBuildPhase() ? BUILD_RETRY_DELAYS_MS : [];

  for (let attempt = 0; ; attempt++) {
    let failure: string;
    try {
      // Next remembers the first answer to a request for the rest of the page's render, so a plain
      // retry would just get the same 403 back. Passing a signal opts out of that (see Next's
      // dedupe-fetch), so retries really reach the API. The first attempt stays a normal fetch.
      const res = await fetch(`${API_URL}${path}`, {
        next: { revalidate },
        ...(attempt > 0 ? { signal: AbortSignal.timeout(30_000) } : {}),
      });
      if (res.status === 404) return null;
      if (res.ok) return (await res.json()) as T;
      failure = `API request failed: GET ${path} -> ${res.status}`;
      if (!RETRYABLE_STATUSES.has(res.status)) throw new Error(failure);
    } catch (err) {
      // Our own "not retryable" error above carries the message already; anything else is a network error.
      if (err instanceof Error && err.message.startsWith('API request failed')) throw err;
      failure = `API request failed: GET ${path} -> ${err instanceof Error ? err.message : 'network error'}`;
    }

    if (attempt >= delays.length) throw new Error(failure);
    console.warn(`${failure} (build attempt ${attempt + 1}/${delays.length + 1}, retrying in ${delays[attempt] / 1000}s)`);
    await sleep(delays[attempt]);
  }
}
