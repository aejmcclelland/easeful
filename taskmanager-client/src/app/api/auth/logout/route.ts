import { NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_BASE! ?? 'http://localhost:3000';

export async function GET(req: Request) {
	try {
		const upstream = `${API}/api/auth/logout`;

		const res = await fetch(upstream, {
			method: 'GET',
			headers: {
				cookie: req.headers.get('cookie') ?? '',
			},
		});

		if (!res.ok) {
			const errorText = await res.text();
			return NextResponse.json(
				{ error: errorText || 'Logout failed' },
				{ status: res.status }
			);
		}

		const data = await res.json();

		// Create response with the same data
		const response = NextResponse.json(data);

		// Clear the local cookie
		response.cookies.set('token', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 0, // This expires the cookie immediately
		});

		return response;
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
