'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { User } from '@/lib/types';

export default function Navbar() {
	const [me, setMe] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isMobileMenuOpen]);

	useEffect(() => {
		getMe();
		// Refresh user data when window gains focus
		window.addEventListener('focus', getMe);
		return () => window.removeEventListener('focus', getMe);
	}, []);

	const getMe = async () => {
		try {
			const res = await fetch('/api/auth/me', {
				credentials: 'include',
			});
			if (res.ok) {
				const data = await res.json();
				setMe(data.data);
			} else {
				setMe(null);
			}
		} catch (error) {
			console.error('Error fetching user:', error);
			setMe(null);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', {
				method: 'GET',
				credentials: 'include',
			});
			setMe(null);
			window.location.reload();
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<nav className='navbar bg-base-100 border-b'>
			<div className='navbar-start'>
				{/* Logo */}
				<div className='dropdown'>
					<div className='btn btn-ghost text-xl font-bold'>
						<i className='fas fa-clipboard-list mr-2'></i>
						Taskman
					</div>
				</div>

				{/* Desktop Navigation */}
				<div className='hidden lg:flex'>
					<ul className='menu menu-horizontal px-1'>
						<li>
							<Link href='/tasks' className='btn btn-ghost btn-sm'>
								<i className='fas fa-tasks mr-2'></i>
								Tasks
							</Link>
						</li>
						<li>
							<Link href='/tasks/new' className='btn btn-ghost btn-sm'>
								<i className='fas fa-plus mr-2'></i>
								New Task
							</Link>
						</li>
					</ul>
				</div>
			</div>

			{/* Mobile Menu Button */}
			<div className='navbar-end lg:hidden'>
				<button
					onClick={toggleMobileMenu}
					className='btn btn-square btn-ghost'
					aria-label='Toggle mobile menu'>
					<div className='w-6 h-6 flex flex-col justify-center items-center'>
						<span
							className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
								isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
							}`}></span>
						<span
							className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${
								isMobileMenuOpen ? 'opacity-0' : ''
							}`}></span>
						<span
							className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${
								isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
							}`}></span>
					</div>
				</button>
			</div>

			{/* Desktop User Menu */}
			<div className='navbar-end hidden lg:flex'>
				{loading ? (
					<div className='loading loading-spinner loading-sm'></div>
				) : me ? (
					<div className='dropdown dropdown-end'>
						<div
							tabIndex={0}
							role='button'
							className='btn btn-ghost btn-circle avatar'>
							<div className='w-10 rounded-full'>
								<i className='fas fa-user text-xl'></i>
							</div>
						</div>
						<ul
							tabIndex={0}
							className='menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52'>
							<li className='menu-title'>
								<span className='text-sm font-medium'>
									<i className='fas fa-user-tag mr-2'></i>
									{me.name || me.email}
								</span>
							</li>
							<li>
								<button onClick={handleLogout} className='text-error'>
									<i className='fas fa-sign-out-alt mr-2 bg-success'></i>
									Logout
								</button>
							</li>
						</ul>
					</div>
				) : (
					<Link href='/login' className='btn btn-primary btn-sm text-success'>
						<i className='fas fa-sign-in-alt mr-2 text-primary'></i>
						Login
					</Link>
				)}
			</div>

			{mounted &&
				isMobileMenuOpen &&
				createPortal(
					<div className='fixed inset-0 z-[9999] lg:hidden'>
						{/* Backdrop covering the whole viewport */}
						<div
							className='absolute inset-0 bg-base-100/80 backdrop-blur-sm'
							onClick={() => setIsMobileMenuOpen(false)}
						/>

						{/* Menu panel below the navbar height (approx 4rem = top-16) */}
						<div className='absolute top-16 left-0 right-0 bg-base-100 border-b border-base-300 shadow-xl'>
							<div className='p-4 space-y-3'>
								{/* Mobile Navigation Links */}
								<div className='space-y-2'>
									<Link
										href='/tasks'
										className='block w-full text-left px-4 py-2 rounded-lg hover:bg-base-200 transition-colors'
										onClick={() => setIsMobileMenuOpen(false)}>
										<i className='fas fa-tasks mr-3'></i>
										Tasks
									</Link>
									<Link
										href='/tasks/new'
										className='block w-full text-left px-4 py-2 rounded-lg hover:bg-base-200 transition-colors'
										onClick={() => setIsMobileMenuOpen(false)}>
										<i className='fas fa-plus mr-3'></i>
										New Task
									</Link>
								</div>

								{/* Mobile User Section */}
								<div className='border-t border-base-300 pt-3'>
									{loading ? (
										<div className='flex items-center px-4 py-2'>
											<div className='loading loading-spinner loading-sm mr-3'></div>
											<span className='text-sm text-base-content/70'>
												Loading...
											</span>
										</div>
									) : me ? (
										<div className='space-y-2'>
											<div className='px-4 py-2 text-sm font-medium text-base-content/70'>
												<i className='fas fa-user-tag mr-2'></i>
												{me.name || me.email}
											</div>
											<button
												onClick={() => {
													handleLogout();
													setIsMobileMenuOpen(false);
												}}
												className='block w-full text-left px-4 py-2 rounded-lg text-error hover:bg-error hover:text-error-content transition-colors bg-accent'>
												<i className='fas fa-sign-out-alt mr-3 text-primary'></i>
												Logout
											</button>
										</div>
									) : (
										<Link
											href='/login'
											className='block w-full text-left px-4 py-2 rounded-lg bg-primary text-primary-content hover:bg-primary-focus transition-colors'
											onClick={() => setIsMobileMenuOpen(false)}>
											<i className='fas fa-sign-in-alt mr-3'></i>
											Login
										</Link>
									)}
								</div>
							</div>
						</div>
					</div>,
					document.body
				)}
		</nav>
	);
}
