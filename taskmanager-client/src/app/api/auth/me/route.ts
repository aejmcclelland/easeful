import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

export async function GET(req: Request) {
	try {
		const upstream = `${API_BASE}/api/auth/me`;

		// Get the token from the request cookies
		const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

		if (!token) {
			return NextResponse.json({ error: 'No token provided' }, { status: 401 });
		}

		const res = await fetch(upstream, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				cookie: req.headers.get('cookie') ?? '',
			},
		});

		if (!res.ok) {
			// If not authenticated, return 401 instead of throwing
			return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
