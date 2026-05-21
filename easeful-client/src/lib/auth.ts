import { apiFetch } from './api';

async function getAuthErrorMessage(res: Response, fallback: string) {
	try {
		const data = await res.json();
		return typeof data?.error === 'string' && data.error ? data.error : fallback;
	} catch {
		return fallback;
	}
}

export async function loginRequest(email: string, password: string) {
	const res = await apiFetch('/api/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
		credentials: 'include',
	});

	if (!res.ok) {
		throw new Error(await getAuthErrorMessage(res, 'Login failed'));
	}

	return res;
}

// registerRequest handles registration errors from the API
export async function registerRequest(
	name: string,
	email: string,
	password: string
) {
	const res = await apiFetch('/api/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, email, password }),
		credentials: 'include',
	});

	if (!res.ok) {
		throw new Error(await getAuthErrorMessage(res, 'Registration failed'));
	}

	return res;
}
