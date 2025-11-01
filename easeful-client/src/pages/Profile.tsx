// src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
	_id: string;
	name: string;
	email: string;
	avatar?: { url?: string };
};

export default function Profile() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const nav = useNavigate();

	useEffect(() => {
		let redirected = false;
		(async () => {
			try {
				const res = await fetch('/api/auth/me', { credentials: 'include' });
				const data = await res.json();
				if (!res.ok) throw new Error(String(res.status));
				setUser(data.data);
			} catch {
				if (!redirected) {
					redirected = true;
					nav('/', { replace: true });
				}
			} finally {
				setLoading(false);
			}
		})();
	}, [nav]);

	if (loading) return <p>Loading…</p>;
	if (!user) return null;

	return (
		<div className='card bg-base-100 shadow p-6 max-w-lg'>
			<div className='flex items-center gap-4'>
				<div className='avatar'>
					<div className='w-16 rounded-full'>
						<img
							src={user.avatar?.url || 'https://placehold.co/128x128?text=User'}
							alt='avatar'
						/>
					</div>
				</div>
				<div>
					<h1 className='text-2xl font-semibold'>{user.name}</h1>
					<p className='text-sm opacity-70'>{user.email}</p>
				</div>
			</div>
		</div>
	);
}
