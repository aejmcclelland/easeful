import type { NextConfig } from 'next';

const API_ORIGIN =
	process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5000'; // your Express port in dev

const nextConfig: NextConfig = {
	output: 'standalone',
	reactStrictMode: true,
	experimental: {
		serverActions: {
			allowedOrigins: ['http://localhost:3000', process.env.APP_HOME_URL].filter(
                (s): s is string => typeof s === 'string'
			),
		},
		// ⬇ prevents static generation attempts for dynamic pages
		dynamicIO: false,
	},
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${API_ORIGIN}/api/:path*`, // proxy to Express backend
			},
		];
	},
	images: {
		remotePatterns: [{ protocol: 'https', hostname: 'img.daisyui.com' }],
	},
};

export default nextConfig;
