import type { User } from './types';

async function safeText(res: Response) {
  try { return await res.text(); } catch { return `${res.status} ${res.statusText}`; }
}

// POST /api/auth/login — Express sets an httpOnly cookie. We must allow cookies.
export async function login(email: string, password: string): Promise<{ success: boolean; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // ⬅️ receive/set cookie
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await safeText(res));
  return res.json();
}

// GET /api/auth/logout — clears the cookie server-side
export async function logout(): Promise<{ success: boolean; data: unknown }> {
  const res = await fetch('/api/auth/logout', {
    method: 'GET',
    credentials: 'include', // ⬅️ send cookie so server can clear it
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await safeText(res));
  return res.json();
}

// GET /api/auth/me — returns the current user when cookie is present
export async function getMe(): Promise<User | null> {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include', // ⬅️ send cookie automatically (we cannot read httpOnly cookie from JS)
    cache: 'no-store',
  });
  if (!res.ok) return null; // not logged in
  const json = await res.json();
  return (json?.data ?? null) as User | null;
}
