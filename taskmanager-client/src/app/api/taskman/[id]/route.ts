import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const upstream = `${API_BASE}/api/taskman/${id}`;

	// Get the token from the request cookies
	const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

	const headers: HeadersInit = {
		cookie: req.headers.get('cookie') ?? '',
	};

	// If we have a token, also pass it as Authorization header
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const res = await fetch(upstream, {
		headers,
		cache: 'no-store',
	});
	return new NextResponse(res.body, {
		status: res.status,
		headers: res.headers,
	});
}
