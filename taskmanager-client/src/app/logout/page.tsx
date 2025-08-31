'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function LogoutPage() {
	const router = useRouter();
	const API = process.env.NEXT_PUBLIC_API_BASE!;
	if (!API) throw new Error('NEXT_PUBLIC_API_BASE is not set');

	useEffect(() => {
		const doLogout = async () => {
			try {
				await fetch(`${API}/api/auth/logout`, {
					method: 'POST', // state-changing → POST
					credentials: 'include', // send/clear cookie on Render
				});
				toast.success('You have been logged out');
			} catch (err) {
				console.error('Logout failed', err);
				toast.error('Logout failed, please try again');
			} finally {
				router.push('/');
				router.refresh(); // softer than full reload
			}
		};

		void doLogout();
	}, [API, router]);

	return (
		<div className='flex justify-center items-center h-64'>
			<p>Logging out...</p>
		</div>
	);
}
