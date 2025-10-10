// src/lib/api.ts
import { headers as nextHeaders, cookies as nextCookies } from 'next/headers';

async function getBaseUrl(): Promise<string> {
	// In the browser, use relative URLs so Next's rewrite applies automatically
	if (typeof window !== 'undefined') return '';
	// On the server, build absolute URL for fetch to avoid "Invalid URL" with relative paths
	const h = await nextHeaders();
	const proto = h.get('x-forwarded-proto') ?? 'http';
	const host = h.get('host');
	if (!host) throw new Error('Missing host header');
	return `${proto}://${host}`;
}
export async function apiGet(path: string, init: RequestInit = {}) {
	const base = await getBaseUrl();
	const url = `${base}${path}`;

	// Merge headers and forward incoming cookies on the server
	const hdrs = new Headers(init.headers);
	if (typeof window === 'undefined') {
		const cookieStore = await nextCookies();
		const cookieStr = cookieStore.toString();
		if (cookieStr) hdrs.set('cookie', cookieStr);
	}

	const res = await fetch(url, {
		...init,
		headers: hdrs,
		credentials: 'include',
		cache: 'no-store',
	});
	return res;
}

export async function getSession() {
	const res = await apiGet('/api/auth/me');
	if (!res.ok) return null;
	return res.json(); // { success: true, data: {...user} }
}

export async function apiJson<T = unknown>(
	path: string,
	opts: { method?: string; body?: any; headers?: HeadersInit } = {}
): Promise<Response> {
	const { method = 'POST', body, headers } = opts;
	const base = await getBaseUrl();
	const url = `${base}${path}`;

	const hdrs = new Headers(headers);
	hdrs.set('Content-Type', 'application/json');

	if (typeof window === 'undefined') {
		const cookieStore = await nextCookies();
		const cookieStr = cookieStore.toString();
		if (cookieStr) hdrs.set('cookie', cookieStr);
	}

	return fetch(url, {
		method,
		headers: hdrs,
		credentials: 'include',
		cache: 'no-store',
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});
}
export async function apiForm(
	path: string,
	formData: FormData,
	opts: { method?: string; headers?: HeadersInit } = {}
): Promise<Response> {
	const { method = 'POST', headers } = opts;

	const base = await getBaseUrl(); // already defined above
	const url = `${base}${path}`;

	const hdrs = new Headers(headers);
	// DO NOT set Content-Type; let fetch set the multipart boundary automatically

	if (typeof window === 'undefined') {
		const cookieStore = await nextCookies(); // already imported at top
		const cookieStr = cookieStore.toString();
		if (cookieStr) hdrs.set('cookie', cookieStr);
	}

	return fetch(url, {
		method,
		headers: hdrs,
		credentials: 'include',
		cache: 'no-store',
		body: formData,
	});
}
