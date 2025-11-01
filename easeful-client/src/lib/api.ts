// src/lib/api.ts
export const API = import.meta.env.VITE_API_URL || '';

export const apiFetch = (path: string, init?: RequestInit) =>
	fetch(`${API}${path}`, { credentials: 'include', ...init });
