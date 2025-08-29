import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
	title: 'Taskmanager App',
	description: 'App to track your tasks',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' data-theme='corporate'>
			<head>
				<script
					src='https://kit.fontawesome.com/641c2545bf.js'
					crossOrigin='anonymous'
					async></script>
			</head>
			<body className='min-h-dvh bg-base-100'>
				<Navbar />
				<main className='container mx-auto p-4'>{children}</main>
				<ToastContainer
					position='top-right'
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme='light'
				/>
			</body>
		</html>
	);
}
