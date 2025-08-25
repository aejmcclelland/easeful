import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const upstream = `${API_BASE}/api/users/register`;

		const res = await fetch(upstream, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const errorText = await res.text();
			return NextResponse.json(
				{ error: errorText || 'Registration failed' },
				{ status: res.status }
			);
		}

		const data = await res.json();

		// Create response with the same data
		const response = NextResponse.json(data);

		// Get the token from the response and set it as a cookie
		if (data.token) {
			response.cookies.set('token', data.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				// Set a reasonable expiration (e.g., 7 days)
				maxAge: 7 * 24 * 60 * 60,
			});
		}

		return response;
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}