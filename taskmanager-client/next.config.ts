import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	async rewrites() {
		  if (process.env.NODE_ENV === 'development') {
				return [
					{
						source: '/api/:path*',
						destination: 'http://localhost:3000/api/:path*',
					},
				];
			}
			return [];
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				port: '',
				pathname: '/**',
			},
		],
	},
	// For development, we can also set the port to avoid conflicts
	// This is optional but can help with cookie issues
	experimental: {
		// Enable if you want to run Next.js on a different port
		// serverComponentsExternalPackages: [],
	},
};

export default nextConfig;
