import type { Metadata } from 'next';

import './globals.css';
import Link from 'next/link';

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
				<nav className='navbar bg-base-100 border-b'>
					<div className='flex-1'>
						<Link href='/' className='btn btn-ghost text-xl'>Taskman</Link>
					</div>
					<div className='flex-none gap-2'>
						<Link href='/tasks' className='btn btn-ghost'>
							Tasks
						</Link>
						<Link href='/login' className='btn btn-primary btn-sm'>
							Login
						</Link>
					</div>
				</nav>
				<main className='container mx-auto p-4'>{children}</main>
			</body>
		</html>
	);
}
