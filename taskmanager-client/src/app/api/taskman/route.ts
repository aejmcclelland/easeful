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
	console.log('Next.js API route POST /api/taskman called');
	try {
		// Get the token from the request cookies
		const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

		if (!token) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		const upstream = `${API_BASE}/api/taskman`;
		
		// Handle both FormData and JSON requests
		const contentType = req.headers.get('content-type');
		console.log('Content-Type:', contentType);
		
		let body;
		let headers: HeadersInit = {
			Authorization: `Bearer ${token}`,
			cookie: req.headers.get('cookie') ?? '',
		};

		if (contentType?.includes('multipart/form-data')) {
			console.log('Handling FormData request');
			// For FormData (file uploads), get the FormData and pass it through
			const formData = await req.formData();
			body = formData;
			// Don't set Content-Type - let fetch set it with boundary for FormData
		} else {
			console.log('Handling JSON request');
			// For JSON requests
			const jsonBody = await req.json();
			body = JSON.stringify(jsonBody);
			headers['Content-Type'] = 'application/json';
		}
		
		console.log('About to fetch upstream:', upstream);

		const res = await fetch(upstream, {
			method: 'POST',
			headers,
			body,
			duplex: 'half',
		} as RequestInit);
		
		console.log('Upstream response status:', res.status);

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
		console.error('Next.js API route error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
