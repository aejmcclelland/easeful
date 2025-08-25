'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { User } from '@/lib/types';

export default function Navbar() {
	const [me, setMe] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [mounted, setMounted] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
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
		// Refresh user data when profile is updated
		window.addEventListener('userProfileUpdated', getMe);
		return () => {
			window.removeEventListener('focus', getMe);
			window.removeEventListener('userProfileUpdated', getMe);
		};
	}, []);

	// Close desktop dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDesktopDropdownOpen(false);
			}
		};

		if (isDesktopDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDesktopDropdownOpen]);

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

	const toggleDesktopDropdown = () => {
		setIsDesktopDropdownOpen(!isDesktopDropdownOpen);
	};

	const handleAvatarUpload = async (file: File) => {
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append('avatar', file);

			const res = await fetch('/api/auth/updateavatar', {
				method: 'PUT',
				credentials: 'include',
				body: formData,
			});

			if (res.ok) {
				const data = await res.json();
				setMe(data.data);
				setIsDesktopDropdownOpen(false);
			} else {
				console.error('Error uploading avatar:', res.statusText);
			}
		} catch (error) {
			console.error('Error uploading avatar:', error);
		} finally {
			setIsUploading(false);
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && file.type.startsWith('image/')) {
			handleAvatarUpload(file);
		}
		// Reset the file input
		if (event.target) {
			event.target.value = '';
		}
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
					<div className='relative' ref={dropdownRef}>
						<button
							onClick={toggleDesktopDropdown}
							className='btn btn-ghost btn-circle avatar'>
							<div className='w-10 rounded-full overflow-hidden'>
								{me.avatar?.url ? (
									<img
										src={me.avatar.url}
										alt={me.name || me.email}
										className='w-full h-full object-cover'
									/>
								) : (
									<div className='w-full h-full bg-primary flex items-center justify-center'>
										<i className='fas fa-user text-primary-content'></i>
									</div>
								)}
							</div>
						</button>
						
						{isDesktopDropdownOpen && (
							<div className='absolute right-0 top-12 z-50 bg-base-100 border border-base-300 shadow-xl rounded-lg min-w-52'>
								<div className='p-4 space-y-2'>
									<div className='px-2 py-1 text-sm font-medium text-base-content/70 border-b border-base-300 pb-2'>
										<i className='fas fa-user-tag mr-2'></i>
										{me.name || me.email}
									</div>
									<button
										onClick={triggerFileInput}
										disabled={isUploading}
										className='w-full text-left px-2 py-2 rounded-lg text-base-content hover:bg-base-200 transition-colors disabled:opacity-50'>
										{isUploading ? (
											<>
												<div className='loading loading-spinner loading-xs mr-3'></div>
												Uploading...
											</>
										) : (
											<>
												<i className='fas fa-camera mr-3'></i>
												{me.avatar?.url ? 'Change Avatar' : 'Upload Avatar'}
											</>
										)}
									</button>
									<Link
										href='/profile'
										onClick={() => setIsDesktopDropdownOpen(false)}
										className='w-full text-left px-2 py-2 rounded-lg text-base-content hover:bg-base-200 transition-colors block'>
										<i className='fas fa-user-edit mr-3'></i>
										Edit Profile
									</Link>
									<button
										onClick={() => {
											handleLogout();
											setIsDesktopDropdownOpen(false);
										}}
										className='w-full text-left px-2 py-2 rounded-lg text-base-content hover:bg-error hover:text-error-content transition-colors'>
										<i className='fas fa-sign-out-alt mr-3'></i>
										Logout
									</button>
								</div>
							</div>
						)}
						
						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							onChange={handleFileChange}
							className='hidden'
						/>
					</div>
				) : (
					<Link href='/login' className='btn btn-primary btn-sm'>
						<i className='fas fa-sign-in-alt mr-2'></i>
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
											<div className='flex items-center px-4 py-2'>
												<div className='w-8 h-8 rounded-full overflow-hidden mr-3'>
													{me.avatar?.url ? (
														<img
															src={me.avatar.url}
															alt={me.name || me.email}
															className='w-full h-full object-cover'
														/>
													) : (
														<div className='w-full h-full bg-primary flex items-center justify-center'>
															<i className='fas fa-user text-xs text-primary-content'></i>
														</div>
													)}
												</div>
												<span className='text-sm font-medium text-base-content/70'>
													{me.name || me.email}
												</span>
											</div>
											<button
												onClick={() => {
													triggerFileInput();
													setIsMobileMenuOpen(false);
												}}
												disabled={isUploading}
												className='block w-full text-left px-4 py-2 rounded-lg text-base-content hover:bg-base-200 transition-colors disabled:opacity-50'>
												{isUploading ? (
													<>
														<div className='loading loading-spinner loading-xs mr-3'></div>
														Uploading...
													</>
												) : (
													<>
														<i className='fas fa-camera mr-3'></i>
														{me.avatar?.url ? 'Change Avatar' : 'Upload Avatar'}
													</>
												)}
											</button>
											<Link
												href='/profile'
												onClick={() => setIsMobileMenuOpen(false)}
												className='block w-full text-left px-4 py-2 rounded-lg text-base-content hover:bg-base-200 transition-colors'>
												<i className='fas fa-user-edit mr-3'></i>
												Edit Profile
											</Link>
											<button
												onClick={() => {
													handleLogout();
													setIsMobileMenuOpen(false);
												}}
												className='block w-full text-left px-4 py-2 rounded-lg text-base-content hover:bg-error hover:text-error-content transition-colors'>
												<i className='fas fa-sign-out-alt mr-3'></i>
												Logout
											</button>
										</div>
									) : (
										<Link
											href='/login'
											className='block w-full text-left px-4 py-2 rounded-lg bg-accent text-base-content hover:bg-error transition-colors'
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
