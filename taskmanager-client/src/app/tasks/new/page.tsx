// src/lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
if (!API_BASE) {
  throw new Error('NEXT_PUBLIC_API_BASE is not set');
}

/**
 * Type guard: is the provided body a FormData?
 */
function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

/**
 * GET-style helper that parses JSON into T.
 * Adds credentials and disables cache by default.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * Internal helper for write operations. Returns raw Response.
 * - Accepts JSON bodies OR FormData.
 * - Only sets `Content-Type: application/json` when body is NOT FormData
 *   and header isn't already provided.
 */
async function apiRequest(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = init.headers ?? {};
  const body = init.body;

  // If sending JSON and caller didn't set a content-type, set it.
  if (body != null && !isFormData(body)) {
    // Normalize to a mutable record
    const h = headers as Record<string, string>;
    const hasContentType =
      Object.keys(h).some((k) => k.toLowerCase() === 'content-type');
    if (!hasContentType) {
      h['Content-Type'] = 'application/json';
    }
  }

  return fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...init,
    headers,
  });
}

/**
 * POST helper. Use with either a JSON string/body or FormData.
 * Example:
 *   await apiPost('/api/easeful', formData);
 *   await apiPost('/api/easeful', JSON.stringify(payload));
 */
export function apiPost(
  path: string,
  body?: BodyInit | null,
  init?: Omit<RequestInit, 'method' | 'body'>
): Promise<Response> {
  return apiRequest(path, { ...(init ?? {}), method: 'POST', body: body ?? undefined });
}

/**
 * PUT helper. Same rules as apiPost.
 */
export function apiPut(
  path: string,
  body?: BodyInit | null,
  init?: Omit<RequestInit, 'method' | 'body'>
): Promise<Response> {
  return apiRequest(path, { ...(init ?? {}), method: 'PUT', body: body ?? undefined });
}

/**
 * DELETE helper. Usually no body, but you can pass one if your API expects it.
 */
export function apiDelete(
  path: string,
  init?: Omit<RequestInit, 'method'>
): Promise<Response> {
  return apiRequest(path, { ...(init ?? {}), method: 'DELETE' });
}
