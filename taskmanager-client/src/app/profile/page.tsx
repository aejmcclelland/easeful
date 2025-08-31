'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faExclamationTriangle,
	faSave,
} from '@fortawesome/free-solid-svg-icons';
import type { User } from '@/lib/types';

export default function ProfilePage() {
	const [formData, setFormData] = useState({ name: '', email: '' });
	const [original, setOriginal] = useState({ name: '', email: '' });
	const [loading, setLoading] = useState(false);
	const [fetchingUser, setFetchingUser] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	// Only enable Save when something changed
	const hasChanges = useMemo(
		() => formData.name !== original.name || formData.email !== original.email,
		[formData, original]
	);

	useEffect(() => {
		const ctrl = new AbortController();

		const fetchUserData = async () => {
			try {
				setFetchingUser(true);
				setError(null);

				const res = await fetch('/api/auth/me', {
					credentials: 'include',
					cache: 'no-store',
					signal: ctrl.signal,
				});

				if (res.status === 401 || res.status === 403) {
					// not logged in → go to login
					router.replace('/login');
					return;
				}
				if (!res.ok) {
					throw new Error(`Failed to fetch user data (${res.status})`);
				}

				const data = await res.json();
				const user: User = data.data;

				const next = {
					name: user.name ?? '',
					email: user.email ?? '',
				};
				setFormData(next);
				setOriginal(next);
			} catch (err) {
				if (ctrl.signal.aborted) return;
				const msg =
					err instanceof Error ? err.message : 'Failed to fetch user data';
				setError(msg);
				toast.error(msg);
			} finally {
				if (!ctrl.signal.aborted) setFetchingUser(false);
			}
		};

		fetchUserData();
		return () => ctrl.abort();
	}, [router]);

	const validateEmail = (email: string): boolean =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!formData.name.trim()) {
			setError('Name is required');
			return;
		}
		if (!formData.email.trim()) {
			setError('Email is required');
			return;
		}
		if (!validateEmail(formData.email)) {
			setError('Please enter a valid email address');
			return;
		}
		if (!hasChanges) {
			toast.info('No changes to save');
			return;
		}

		setLoading(true);
		try {
			const res = await fetch('/api/auth/updatedetails', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
				credentials: 'include',
			});

			if (res.status === 401) {
				toast.error('Please log in again');
				router.replace('/login');
				return;
			}
			if (!res.ok) {
				let msg = 'Failed to update profile';
				try {
					const j = await res.json();
					msg = j.error || j.message || msg;
				} catch {}
				throw new Error(msg);
			}

			// success
			setOriginal(formData);
			toast.success('Profile updated successfully!');
			window.dispatchEvent(new CustomEvent('userProfileUpdated'));
			router.refresh(); // ensure navbar/user state updates
			router.push('/tasks');
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : 'Failed to update profile';
			setError(msg);
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	if (fetchingUser) {
		return (
			<div className='max-w-2xl mx-auto p-4'>
				<div className='flex justify-center items-center py-12'>
					<div className='loading loading-spinner loading-lg' />
					<span className='ml-3 text-lg'>Loading profile...</span>
				</div>
			</div>
		);
	}

	if (error && !formData.name && !formData.email) {
		return (
			<div className='max-w-2xl mx-auto p-4'>
				<div className='alert alert-error' role='alert' aria-live='polite'>
					<FontAwesomeIcon
						icon={faExclamationTriangle}
						style={{ width: 18, height: 18 }}
					/>
					<span>{error}</span>
				</div>
				<Link href='/tasks' className='btn btn-primary mt-4 rounded-full'>
					{'\u2190'} Back to tasks
				</Link>
			</div>
		);
	}

	return (
		<div className='max-w-2xl mx-auto p-4'>
			<div className='mb-6'>
				<Link href='/tasks' className='link link-hover text-sm'>
					{'\u2190'} Back to tasks
				</Link>
				<h1 className='text-2xl font-bold mt-2'>Edit Profile</h1>
				<p className='text-base-content/70 mt-1'>
					Update your account information
				</p>
			</div>

			<div className='card bg-base-100 shadow-md'>
				<div className='card-body'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='form-control'>
							<label className='label'>
								<span className='label-text'>Full Name *</span>
							</label>
							<input
								type='text'
								name='name'
								value={formData.name}
								onChange={handleChange}
								className='input input-bordered w-full'
								placeholder='Enter your full name'
								required
							/>
						</div>

						<div className='form-control'>
							<label className='label'>
								<span className='label-text'>Email Address *</span>
							</label>
							<input
								type='email'
								name='email'
								value={formData.email}
								onChange={handleChange}
								className='input input-bordered w-full'
								placeholder='Enter your email address'
								required
							/>
							<label className='label'>
								<span className='label-text-alt'>
									Make sure this email is valid as it&apos;s used for account
									recovery
								</span>
							</label>
						</div>

						{error && (
							<div
								className='alert alert-error'
								role='alert'
								aria-live='polite'>
								<FontAwesomeIcon
									icon={faExclamationTriangle}
									style={{ width: 18, height: 18 }}
								/>
								<span>{error}</span>
							</div>
						)}

						<div className='card-actions justify-end'>
							<Link
								href='/tasks'
								className='btn btn-ghost rounded-full'
								tabIndex={loading ? -1 : 0}>
								Cancel
							</Link>
							<button
								type='submit'
								className='btn btn-primary rounded-full'
								disabled={loading || !hasChanges}
								title={!hasChanges ? 'No changes to save' : undefined}>
								{loading ? (
									<>
										<div className='loading loading-spinner loading-sm mr-2' />
										Updating...
									</>
								) : (
									<>
										<FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />
										Save Changes
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
