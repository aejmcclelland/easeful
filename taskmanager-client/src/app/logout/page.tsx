'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
	const router = useRouter();

	useEffect(() => {
		const doLogout = async () => {
			try {
				await fetch('/api/auth/logout', {
					method: 'GET',
					credentials: 'include',
				});
			} catch (err) {
				console.error('Logout failed', err);
			} finally {
				// whether or not logout request succeeds, push home & refresh
				router.push('/');
				// Force a hard refresh to ensure cookies are properly cleared
				window.location.reload();
			}
		};

		doLogout();
	}, [router]);

	return (
		<div className='flex justify-center items-center h-64'>
			<p>Logging out...</p>
		</div>
	);
}
