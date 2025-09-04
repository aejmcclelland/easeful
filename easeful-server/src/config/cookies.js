// src/config/cookies.js
const DAY = 24 * 60 * 60 * 1000;
const COOKIE_NAME = 'sid';

function sessionCookieOptions(days = 1) {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax', // use 'none' only if truly cross-site
		path: '/',
		maxAge: days * DAY,
	};
}

module.exports = { COOKIE_NAME, sessionCookieOptions, DAY };
