import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

// Proxy GET /api/taskman -> Express
export async function GET(req: Request) {
	// Get the token from the request cookies
	const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

	if (!token) {
		return NextResponse.json(
			{ error: 'Authentication required' },
			{ status: 401 }
		);
	}

	const url = new URL(req.url);
	// Preserve path and search when hitting e.g. /api/taskman?foo=bar
	const upstream = `${API_BASE}${url.pathname.replace(/^\/api/, '/api')}${
		url.search
	}`;

	const headers: HeadersInit = {
		cookie: req.headers.get('cookie') ?? '',
		Authorization: `Bearer ${token}`,
	};

	const res = await fetch(upstream, {
		headers,
		cache: 'no-store',
	});

	// stream response back to the client, including Set-Cookie if any
	return new NextResponse(res.body, {
		status: res.status,
		headers: res.headers, // Next will forward Set-Cookie correctly
	});
}

// Proxy POST /api/taskman -> Express
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const upstream = `${API_BASE}/api/taskman`;

		// Get the token from the request cookies
		const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

		if (!token) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		const res = await fetch(upstream, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				cookie: req.headers.get('cookie') ?? '',
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const errorText = await res.text();
			return NextResponse.json(
				{ error: errorText || 'Failed to create task' },
				{ status: res.status }
			);
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
