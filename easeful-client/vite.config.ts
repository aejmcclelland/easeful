import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler']],
			},
		}),
	],
	server: {
		port: 3001,
		proxy: {
			// browser calls http://localhost:3001/api/... → forwarded to :3000
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
				// preserve cookie set by the API
				configure: (proxy) => {
					proxy.on('proxyRes', (proxyRes) => {
						// helpful when debugging cookies during dev
						console.log('Set-Cookie:', proxyRes.headers['set-cookie']);
					});
				},
			},
		},
		hmr: {
			host: 'localhost',
			protocol: 'ws',
			port: 3001,
		},
	},
});
