export async function loginRequest(email: string, password: string) {
	const res = await fetch('/api/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
		credentials: 'include',
	});

	if (!res.ok) {
		let msg = 'Login failed';
		try {
			const data = await res.json();
			if (data?.error) msg = data.error;
		} catch {
			// ignore JSON parse errors
		}
		throw new Error(msg);
	}

	return res;
}

// registerRequest to hadle registration errors
export async function registerRequest(
	name: string,
	email: string,
	password: string
) {
	const res = await fetch('/api/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, email, password }),
		credentials: 'include',
	});

	if (!res.ok) {
		let msg = 'Registration failed';
		try {
			const data = await res.json();
			if (data?.error) msg = data.error;
		} catch {
			// ignore JSON parse errors
		}
		throw new Error(msg);
	}

	return res;
}
