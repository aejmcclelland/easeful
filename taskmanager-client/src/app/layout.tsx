import type { Metadata } from 'next';

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
			<body className='min-h-dvh bg-base-100'>
				<Navbar />
				<main className='container mx-auto p-4'>{children}</main>
			</body>
		</html>
	);
}
