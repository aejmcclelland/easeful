'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const res = await fetch(`/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
				credentials: 'include', // ⬅️ important so cookie is saved
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Invalid credentials');
			}

			// success → go home & refresh so Navbar updates
			router.push('/');
			// Force a hard refresh to ensure cookies are properly set
			window.location.reload();
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Login failed';
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-md mx-auto p-6'>
			<h1 className='text-2xl font-bold mb-4'>Login</h1>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<input
					type='email'
					placeholder='Email'
					className='input input-bordered w-full'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					disabled={loading}
				/>
				<input
					type='password'
					placeholder='Password'
					className='input input-bordered w-full'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					disabled={loading}
				/>
				{error && <p className='text-red-500 text-sm'>{error}</p>}
				<button
					type='submit'
					className='btn btn-primary w-full'
					disabled={loading}>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>
		</div>
	);
}
