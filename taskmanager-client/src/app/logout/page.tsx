'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { apiPost } from '@/lib/api';

export default function LogoutPage() {
	const router = useRouter();

	useEffect(() => {
		const doLogout = async () => {
			try {
				await apiPost('/api/auth/logout', {});
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
	}, [router]);

	return (
		<div className='flex justify-center items-center h-64'>
			<p>Logging out...</p>
		</div>
	);
}
