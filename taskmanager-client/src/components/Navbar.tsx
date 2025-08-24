'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, logout } from '@/lib/auth';
import type { User } from '@/lib/types';

export default function Navbar() {
	const [me, setMe] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Check session on mount
	useEffect(() => {
		const checkAuth = async () => {
			try {
				setLoading(true);
				console.log('Checking authentication...');
				const user = await getMe();
				console.log('Auth check result:', user);
				setMe(user);
			} catch (error) {
				console.error('Auth check failed:', error);
				setMe(null);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	// Also re-check when the tab regains focus (helps after login redirect)
	useEffect(() => {
		const onFocus = () => {
			console.log('Tab focused, re-checking auth...');
			getMe()
				.then((user) => {
					console.log('Focus auth check result:', user);
					setMe(user);
				})
				.catch((error) => {
					console.error('Focus auth check failed:', error);
					setMe(null);
				});
		};
		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
	}, []);

	async function handleLogout() {
		try {
			console.log('Logging out...');
			await logout();
			console.log('Logout successful');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setMe(null);
			router.push('/login');
			router.refresh();
		}
	}

	return (
		<div className='navbar bg-base-100 border-b shadow-sm'>
			{/* Left side - Logo and main navigation */}
			<div className='navbar-start'>
				<div className='dropdown'>
					<div tabIndex={0} role='button' className='btn btn-ghost lg:hidden'>
						<i className='fas fa-bars text-lg'></i>
					</div>
					<ul
						tabIndex={0}
						className='menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52'>
						<li>
							<Link href='/tasks'>
								<i className='fas fa-tasks mr-2'></i>
								Tasks
							</Link>
						</li>
						<li>
							<Link href='/tasks/new'>
								<i className='fas fa-plus mr-2'></i>
								New Task
							</Link>
						</li>
					</ul>
				</div>
				<Link href='/' className='btn btn-ghost text-xl font-bold'>
					<i className='fas fa-clipboard-list mr-2'></i>
					Taskman
				</Link>
			</div>

			{/* Center - Main navigation (hidden on mobile) */}
			<div className='navbar-center hidden lg:flex'>
				<ul className='menu menu-horizontal px-1 gap-2'>
					<li>
						<Link
							href='/tasks'
							className='btn btn-ghost btn-sm normal-case font-medium'>
							<i className='fas fa-tasks mr-2'></i>
							Tasks
						</Link>
					</li>
					<li>
						<Link
							href='/tasks/new'
							className='btn btn-primary btn-sm normal-case font-medium'>
							<i className='fas fa-plus mr-2'></i>
							New Task
						</Link>
					</li>
				</ul>
			</div>

			{/* Right side - User info and actions */}
			<div className='navbar-end'>
				{loading ? (
					<div className='flex items-center gap-2'>
						<i className='fas fa-spinner fa-spin text-primary'></i>
						<span className='text-sm opacity-70 hidden sm:inline'>
							Loading...
						</span>
					</div>
				) : me ? (
					<div className='flex items-center gap-3'>
						{/* User info */}
						<div className='hidden sm:flex flex-col items-end'>
							<span className='text-sm font-medium text-base-content'>
								{me.name}
							</span>
							<span className='text-xs opacity-70 text-base-content/70'>
								<i className='fas fa-user-tag mr-1'></i>
								{me.role}
							</span>
						</div>

						{/* User avatar */}
						<div className='avatar placeholder'>
							<div className='bg-primary text-primary-content rounded-full w-10'>
								<i className='fas fa-user text-sm'></i>
							</div>
						</div>

						{/* Logout button */}
						<button
							onClick={handleLogout}
							className='btn btn-ghost btn-sm text-error hover:text-error-content'>
							<i className='fas fa-sign-out-alt mr-2'></i>
							Logout
						</button>
					</div>
				) : (
					<div className='flex items-center gap-2'>
						<Link
							href='/login'
							className='btn btn-primary btn-sm normal-case font-medium'>
							<i className='fas fa-sign-in-alt mr-2'></i>
							Login
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
