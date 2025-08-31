// src/lib/api.ts
class HttpError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
if (!API_BASE) {
	throw new Error('NEXT_PUBLIC_API_BASE is not set');
}

function buildUrl(path: string): string {
	// Accept absolute URLs or join to API_BASE
	if (/^https?:\/\//i.test(path)) return path;
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${API_BASE}${p}`;
}

async function parseOrThrow<T = unknown>(res: Response): Promise<T> {
	const ct = res.headers.get('content-type') || '';
	if (res.ok) {
		if (ct.includes('application/json')) {
			return (await res.json()) as T;
		}
		// Non-JSON successful responses (rare in your app)
		return (await res.text()) as unknown as T;
	}

	// Error path – try to extract meaningful message
	let message = `HTTP ${res.status}`;
	try {
		if (ct.includes('application/json')) {
			const body = await res.json();
			message = (body && (body.error || body.message)) || message;
		} else {
			const text = await res.text();
			message = text || message;
		}
	} catch {
		// ignore parse errors; keep default message
	}
	throw new HttpError(res.status, message);
}

/** GET JSON */
export async function apiGet<T>(
	path: string,
	init: RequestInit = {}
): Promise<T> {
	const res = await fetch(buildUrl(path), {
		method: 'GET',
		credentials: 'include',
		cache: 'no-store',
		...init,
	});
	return parseOrThrow<T>(res);
}

/** POST JSON -> JSON */
export async function apiPostJson<TReq, TRes>(
	path: string,
	body: TReq,
	init: RequestInit = {}
): Promise<TRes> {
	const res = await fetch(buildUrl(path), {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
		body: JSON.stringify(body),
		...init,
	});
	return parseOrThrow<TRes>(res);
}

/** PUT JSON -> JSON */
export async function apiPutJson<TReq, TRes>(
	path: string,
	body: TReq,
	init: RequestInit = {}
): Promise<TRes> {
	const res = await fetch(buildUrl(path), {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
		body: JSON.stringify(body),
		...init,
	});
	return parseOrThrow<TRes>(res);
}

/** PUT FormData (for images) -> JSON */
export async function apiPutForm<TRes>(
	path: string,
	form: FormData,
	init: RequestInit = {}
): Promise<TRes> {
	const res = await fetch(buildUrl(path), {
		method: 'PUT',
		credentials: 'include',
		body: form, // do NOT set Content-Type; browser will set boundary
		...init,
	});
	return parseOrThrow<TRes>(res);
}

/** POST FormData (for images) -> JSON */
export async function apiPostForm<TRes>(
	path: string,
	form: FormData,
	init: RequestInit = {}
): Promise<TRes> {
	const res = await fetch(buildUrl(path), {
		method: 'POST',
		credentials: 'include',
		body: form, // do NOT set Content-Type; browser will set boundary
		...init,
	});
	return parseOrThrow<TRes>(res);
}

/** DELETE (expects JSON response) */
export async function apiDeleteJson<TRes>(
	path: string,
	init: RequestInit = {}
): Promise<TRes> {
	const res = await fetch(buildUrl(path), {
		method: 'DELETE',
		credentials: 'include',
		...init,
	});
	return parseOrThrow<TRes>(res);
}

/** DELETE (no content needed) */
export async function apiDelete(
	path: string,
	init: RequestInit = {}
): Promise<void> {
	const res = await fetch(buildUrl(path), {
		method: 'DELETE',
		credentials: 'include',
		...init,
	});
	await parseOrThrow(res);
}

/** Convenience alias to match older imports */
export function apiFetch<T>(
	path: string,
	init: RequestInit = {}
): Promise<T> {
	return apiGet<T>(path, init);
}

/** Convenience wrappers with TRes first */
export function apiPost<TRes, TReq = unknown>(
	path: string,
	body: TReq,
	init: RequestInit = {}
): Promise<TRes> {
	return apiPostJson<TReq, TRes>(path, body, init);
}

export function apiPut<TRes, TReq = unknown>(
	path: string,
	body: TReq,
	init: RequestInit = {}
): Promise<TRes> {
	return apiPutJson<TReq, TRes>(path, body, init);
}

export { HttpError };
