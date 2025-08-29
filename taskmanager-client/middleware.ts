import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	
	// Check if user has auth cookie (JWT token)
	const hasAuthCookie = request.cookies.has('token');
	
	// Redirect authenticated users away from auth pages
	if (hasAuthCookie && (pathname === '/login' || pathname === '/register')) {
		return NextResponse.redirect(new URL('/tasks', request.url));
	}
	
	// Redirect unauthenticated users away from protected pages
	if (!hasAuthCookie && pathname.startsWith('/tasks')) {
		return NextResponse.redirect(new URL('/register', request.url));
	}
	
	return NextResponse.next();
}

export const config = {
	matcher: ['/login', '/register', '/tasks/:path*']
};