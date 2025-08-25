'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import type { User } from '@/lib/types';

export default function ProfilePage() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
	});
	const [loading, setLoading] = useState(false);
	const [fetchingUser, setFetchingUser] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setFetchingUser(true);
				const res = await fetch('/api/auth/me', {
					credentials: 'include',
				});

				if (!res.ok) {
					throw new Error('Failed to fetch user data');
				}

				const data = await res.json();
				const user: User = data.data;

				setFormData({
					name: user.name || '',
					email: user.email || '',
				});
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Failed to fetch user data';
				setError(msg);
				toast.error(msg);
			} finally {
				setFetchingUser(false);
			}
		};

		fetchUserData();
	}, []);

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Client-side validation
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

		setLoading(true);

		try {
			const res = await fetch('/api/auth/updatedetails', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
				credentials: 'include',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to update profile');
			}

			// Show success toast
			toast.success('Profile updated successfully!');

			// Dispatch event to refresh navbar user data
			window.dispatchEvent(new CustomEvent('userProfileUpdated'));

			// Redirect to tasks
			router.push('/tasks');
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to update profile';
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
					<div className='loading loading-spinner loading-lg'></div>
					<span className='ml-3 text-lg'>Loading profile...</span>
				</div>
			</div>
		);
	}

	if (error && fetchingUser === false && !formData.name && !formData.email) {
		return (
			<div className='max-w-2xl mx-auto p-4'>
				<div className='alert alert-error'>
					<i className='fas fa-exclamation-triangle text-lg'></i>
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
									Make sure this email is valid as it&apos;s used for account recovery
								</span>
							</label>
						</div>

						{error && (
							<div className='alert alert-error'>
								<i className='fas fa-exclamation-triangle text-lg'></i>
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
								disabled={loading}>
								{loading ? (
									<>
										<div className='loading loading-spinner loading-sm mr-2'></div>
										Updating...
									</>
								) : (
									<>
										<i className='fas fa-save mr-2'></i>
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