import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
	const hasToken = Boolean(req.cookies.get('token'));

	if (!hasToken) {
		const url = req.nextUrl.clone();
		url.pathname = '/login';
		url.searchParams.set('from', req.nextUrl.pathname + req.nextUrl.search);
		return NextResponse.redirect(url);
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/tasks/:path*'],
};
