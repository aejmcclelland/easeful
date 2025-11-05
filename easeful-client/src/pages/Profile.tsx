// src/pages/Profile.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AvatarUploader from '../components/AvatarUploader';

export default function Profile() {
	const { user, loading } = useAuth();
	const nav = useNavigate();

	// If not authenticated (after auth has loaded), go home
	useEffect(() => {
		if (!loading && !user) {
			nav('/', { replace: true });
		}
	}, [loading, user, nav]);

	if (loading || !user) return null; // App-level <LoadingScreen /> will cover loading

	return (
		<div className='card bg-base-100 shadow p-6 max-w-2xl mx-auto'>
			<h1 className='text-3xl text-primary font-bold mb-4 text-center'>
				Profile
			</h1>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
				<div className='lg:col-span-1'>
					<AvatarUploader currentUrl={user.avatar?.url} />
				</div>
				<div className='lg:col-span-2 space-y-3'>
					<div>
						<div className='label'>Name</div>
						<div className='font-medium'>{user.name}</div>
					</div>
					<div>
						<div className='label'>Email</div>
						<div className='font-medium'>{user.email}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
