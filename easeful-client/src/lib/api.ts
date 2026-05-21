// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';

export const API = API_BASE;

export const apiFetch = (path: string, init?: RequestInit) => {
	const normalisedPath = path.startsWith('/') ? path : '/' + path;

	return fetch(`${API}${normalisedPath}`, {
		credentials: 'include',
		...init,
	});
};
