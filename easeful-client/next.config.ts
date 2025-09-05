import type { NextConfig } from 'next';

const API_ORIGIN =
	process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:3000';

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${API_ORIGIN}/api/:path*`,
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'img.daisyui.com',
				port: '',
				search: '',
			},
		],
	},
};
export default nextConfig;
