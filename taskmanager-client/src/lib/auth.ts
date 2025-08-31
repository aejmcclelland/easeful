import type { User } from './types';
import { apiPost, apiGet } from '@/lib/api';

async function safeText(res: Response) {
	try {
		return await res.text();
	} catch {
		return `${res.status} ${res.statusText}`;
	}
}

// POST /api/auth/login — Express sets an httpOnly cookie. We must allow cookies.
export async function login(
	email: string,
	password: string
): Promise<{ success: boolean; token: string }> {
	return apiPost<{ success: boolean; token: string }>(
		'/api/auth/login',
		+{ email, password }
	);
}

// GET /api/auth/logout — clears the cookie server-side
export async function logout(): Promise<{ success: boolean; data: unknown }> {
	const res = await apiPost('/api/auth/logout', {}) as Response;
	if (!res.ok) throw new Error(await safeText(res));
	return res.json();
}

// GET /api/auth/me — returns the current user when cookie is present
export async function getMe(): Promise<User | null> {
	const response = await apiGet<{ success: boolean; data: User }>('/api/auth/me');
	return response?.data ?? null;
}
