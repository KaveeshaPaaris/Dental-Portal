/**
 * Server-side fetch helper for pages that render API content.
 *
 * Why this exists: pages are cached and regenerated in the background (ISR). If the API
 * has a hiccup and a page "handles" it by returning an empty list, that EMPTY page becomes
 * the new cached version and replaces the good one. So instead:
 *   - 404            -> returns null  (the item genuinely doesn't exist)
 *   - any other fail -> throws        (Next keeps serving the last good page and retries later)
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function apiFetch<T>(path: string, revalidate: number): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API request failed: GET ${path} -> ${res.status}`);
  }
  return (await res.json()) as T;
}
