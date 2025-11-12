// Vite: use import.meta.env.DEV instead of process.env.NODE_ENV
const API_BASE = import.meta.env.DEV ? '/api/easeful' : '/api/tasks';

export async function deleteMe() {
	const response = await fetch(`${API_BASE}/auth/me`, {
		method: 'DELETE',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({}),
	});
	if (!response.ok) {
		throw new Error('Failed to delete user account');
	}
	return await response.json();
}
