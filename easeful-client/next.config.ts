import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
