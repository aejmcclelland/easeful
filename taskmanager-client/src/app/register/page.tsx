'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [role, setRole] = useState('user');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validate passwords match
		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		// Validate password length
		if (password.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}

		setLoading(true);

		try {
			const res = await fetch(`/api/users/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password, role }),
				credentials: 'include',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Registration failed');
			}

			// success → go home & refresh so Navbar updates
			router.push('/');
			window.location.reload();
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Registration failed';
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-md mx-auto p-6'>
			<h1 className='text-2xl font-bold mb-4'>Create Account</h1>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<input
					type='text'
					placeholder='Full Name'
					className='input input-bordered w-full'
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					disabled={loading}
				/>
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
					placeholder='Password (min 6 characters)'
					className='input input-bordered w-full'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					disabled={loading}
					minLength={6}
				/>
				<input
					type='password'
					placeholder='Confirm Password'
					className='input input-bordered w-full'
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
					disabled={loading}
				/>
				<select
					className='select select-bordered w-full'
					value={role}
					onChange={(e) => setRole(e.target.value)}
					disabled={loading}>
					<option value='user'>User</option>
					<option value='publisher'>Publisher</option>
				</select>
				{error && <p className='text-red-500 text-sm'>{error}</p>}
				<button
					type='submit'
					className='btn btn-primary w-full'
					disabled={loading}>
					{loading ? 'Creating Account...' : 'Create Account'}
				</button>
			</form>
			<p className='text-center mt-4 text-sm'>
				Already have an account?{' '}
				<Link href='/login' className='link link-primary'>
					Login here
				</Link>
			</p>
		</div>
	);
}