'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const API = process.env.NEXT_PUBLIC_API_BASE!;

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [checkingAuth, setCheckingAuth] = useState(true);
	const router = useRouter();

	// Check if user is already authenticated
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await fetch(`${API}/api/auth/me`, {
					credentials: 'include',
				});
				
				if (res.ok) {
					// User is already authenticated, redirect to tasks
					router.replace('/tasks');
					return;
				}
			} catch {
				// User not authenticated, continue with login form
			} finally {
				setCheckingAuth(false);
			}
		};

		checkAuth();
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const res = await fetch(`${API}/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
				credentials: 'include', 
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Invalid credentials');
			}

			// success → go to tasks & refresh so Navbar updates
			router.replace('/tasks');
			router.refresh();
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Login failed';
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	// Don't render anything while checking auth to prevent flash
	if (checkingAuth) {
		return null;
	}

	return (
		<div className='max-w-md mx-auto p-6'>
			<h1 className='text-3xl font-bold mb-6 text-center'>Login</h1>
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
					className='btn btn-primary btn-lg w-full rounded-full'
					disabled={loading}>
					{loading ? (
						'Logging in...'
					) : (
						<>
							<FontAwesomeIcon icon={faSignInAlt} />
							Login
						</>
					)}
				</button>
			</form>
			<p className='text-center mt-6 text-base'>
				Don&apos;t have an account?{' '}
				<Link href='/register' className='link link-primary font-semibold'>
					Register here
				</Link>
			</p>
		</div>
	);
}
