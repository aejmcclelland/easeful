import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

export async function PUT(req: Request) {
	// Get the token from the request cookies
	const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

	if (!token) {
		return NextResponse.json(
			{ error: 'Authentication required' },
			{ status: 401 }
		);
	}

	const body = await req.json();
	const upstream = `${API_BASE}/api/auth/updatedetails`;

	const res = await fetch(upstream, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			cookie: req.headers.get('cookie') ?? '',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const errorText = await res.text();
		return NextResponse.json(
			{ error: errorText || 'Failed to update profile' },
			{ status: res.status }
		);
	}

	const data = await res.json();
	return NextResponse.json(data);
}