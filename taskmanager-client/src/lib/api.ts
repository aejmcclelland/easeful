export async function apiFetch<T>(
	input: string,
	init?: RequestInit
): Promise<T> {
	const res = await fetch(input, {
		...init,
		// Auth endpoints / task writes should not be cached
		cache: 'no-store',
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers || {}),
		},
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `Request failed: ${res.status}`);
	}
	return res.json() as Promise<T>;
}
