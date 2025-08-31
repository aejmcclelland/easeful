import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	// Get the token from the request cookies
	const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

	if (!token) {
		return NextResponse.json(
			{ error: 'Authentication required' },
			{ status: 401 }
		);
	}

	const { id } = await params;
	const upstream = `${API_BASE}/api/easeful/${id}`;

	const headers: HeadersInit = {
		cookie: req.headers.get('cookie') ?? '',
		Authorization: `Bearer ${token}`,
	};

	const res = await fetch(upstream, {
		headers,
		cache: 'no-store',
	});
	return new NextResponse(res.body, {
		status: res.status,
		headers: res.headers,
	});
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	// Get the token from the request cookies
	const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

	if (!token) {
		return NextResponse.json(
			{ error: 'Authentication required' },
			{ status: 401 }
		);
	}

	const { id } = await params;
	const upstream = `${API_BASE}/api/taskman/${id}`;

	const res = await fetch(upstream, {
		method: 'DELETE',
		headers: {
			cookie: req.headers.get('cookie') ?? '',
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) {
		const errorText = await res.text();
		return NextResponse.json(
			{ error: errorText || 'Failed to delete task' },
			{ status: res.status }
		);
	}

	const data = await res.json();
	return NextResponse.json(data);
}

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	// Get the token from the request cookies
	const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

	if (!token) {
		return NextResponse.json(
			{ error: 'Authentication required' },
			{ status: 401 }
		);
	}

	const { id } = await params;
	const body = await req.json();
	const upstream = `${API_BASE}/api/taskman/${id}`;

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
			{ error: errorText || 'Failed to update task' },
			{ status: res.status }
		);
	}

	const data = await res.json();
	return NextResponse.json(data);
}
