'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import type { User } from '@/lib/types';

export default function Navbar() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [mobileOpen, setMobileOpen] = useState(false);
	const router = useRouter();

	// Load current user (if any)
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await apiGet<{ success: boolean; data: User }>(
					'/api/auth/me'
				);
				if (mounted) setUser(res.data);
			} catch {
				if (mounted) setUser(null);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const handleLogout = async () => {
		try {
			await apiPost('/api/auth/logout', {});
		} catch {
			// ignore; we’ll still redirect
		} finally {
			setUser(null);
			setMobileOpen(false);
			router.push('/');
			router.refresh();
		}
	};

	// Basic items shown in both desktop & mobile menus
	const NavLinks = () => (
		<>
			<li>
				<Link href='/' onClick={() => setMobileOpen(false)}>
					Home
				</Link>
			</li>
			{user && (
				<li>
					<Link href='/tasks' onClick={() => setMobileOpen(false)}>
						Tasks
					</Link>
				</li>
			)}
			{!user && (
				<li>
					<Link
						href='/login'
						className='font-semibold'
						onClick={() => setMobileOpen(false)}>
						Login
					</Link>
				</li>
			)}
			{user && (
				<>
					<li>
						<Link href='/profile' onClick={() => setMobileOpen(false)}>
							Profile
						</Link>
					</li>
					<li>
						<button className='btn btn-ghost' onClick={handleLogout}>
							Logout
						</button>
					</li>
				</>
			)}
		</>
	);

	return (
		<nav className='navbar bg-base-100 border-b sticky top-0 z-50'>
			<div className='navbar-start'>
				{/* Mobile menu toggle */}
				<button
					className='btn btn-ghost lg:hidden'
					aria-label='Open menu'
					onClick={() => setMobileOpen((o) => !o)}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-5 w-5'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M4 6h16M4 12h16M4 18h16'
						/>
					</svg>
				</button>

				<Link href='/' className='btn btn-ghost text-xl'>
					Easeful
				</Link>
			</div>

			{/* Desktop menu */}
			<div className='navbar-center hidden lg:flex'>
				<ul className='menu menu-horizontal gap-2'>
					<NavLinks />
				</ul>
			</div>

			<div className='navbar-end'>
				{/* Right side: user or loading skeleton */}
				{loading ? (
					<div className='flex items-center gap-3'>
						<div className='skeleton h-4 w-24' />
					</div>
				) : user ? (
					<div className='dropdown dropdown-end'>
						<div tabIndex={0} role='button' className='btn btn-ghost gap-2'>
							<div className='avatar'>
								<div className='w-8 rounded-full ring ring-base-300'>
									{/* Use avatar URL if you store it; fallback to initials */}
									{user.avatar?.url ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={user.avatar.url} alt={user.name ?? 'Avatar'} />
									) : (
										<div className='w-8 h-8 flex items-center justify-center bg-base-300 rounded-full'>
											<span className='text-xs font-semibold'>
												{(user.name ?? 'U').slice(0, 1).toUpperCase()}
											</span>
										</div>
									)}
								</div>
							</div>
							<span className='hidden md:inline'>{user.name ?? 'Account'}</span>
						</div>
						<ul
							tabIndex={0}
							className='menu dropdown-content z-50 mt-3 p-2 shadow bg-base-100 rounded-box w-52'>
							<li>
								<Link href='/profile'>Profile</Link>
							</li>
							<li>
								<button onClick={handleLogout}>Logout</button>
							</li>
						</ul>
					</div>
				) : (
					<Link className='btn btn-primary btn-sm rounded-full' href='/login'>
						Login
					</Link>
				)}
			</div>

			{/* Mobile sheet */}
			{mobileOpen && (
				<div
					className='fixed inset-0 z-[60] lg:hidden'
					aria-hidden='true'
					onClick={() => setMobileOpen(false)}>
					{/* backdrop */}
					<div className='absolute inset-0 bg-base-300/40' />
					{/* sheet */}
					<div
						className='absolute top-0 left-0 w-72 h-full bg-base-100 shadow-xl p-4'
						onClick={(e) => e.stopPropagation()}>
						<div className='flex items-center justify-between mb-4'>
							<span className='text-lg font-semibold'>Menu</span>
							<button
								className='btn btn-ghost btn-sm'
								onClick={() => setMobileOpen(false)}>
								Close
							</button>
						</div>
						<ul className='menu gap-2'>
							<NavLinks />
						</ul>
					</div>
				</div>
			)}
		</nav>
	);
}
