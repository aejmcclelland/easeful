'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DesktopUserMenu from './DesktopUserMenu';
import MobileMenu from './MobileMenu';
import MobileHamburgerButton from './MobileHamburgerButton';
import type { User } from '@/lib/types';

export default function Navbar() {
	const [me, setMe] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

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

	const closeDesktopDropdown = () => {
		setIsDesktopDropdownOpen(false);
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
				closeDesktopDropdown();
			} else {
				console.error('Error uploading avatar:', res.statusText);
			}
		} catch (error) {
			console.error('Error uploading avatar:', error);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<nav className='navbar bg-base-100 border-b'>
			<div className='navbar-start'>
				{/* Logo */}
				<div className='dropdown'>
					<Link href='/' className='btn btn-ghost text-xl font-bold'>
						<i className='fas fa-clipboard-list mr-2'></i>
						Easeful
					</Link>
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
				<MobileHamburgerButton
					isOpen={isMobileMenuOpen}
					onClick={toggleMobileMenu}
				/>
			</div>

			{/* Desktop User Menu */}
			<div className='navbar-end hidden lg:flex'>
				{loading ? (
					<div className='loading loading-spinner loading-sm'></div>
				) : me ? (
					<DesktopUserMenu
						user={me}
						isOpen={isDesktopDropdownOpen}
						isUploading={isUploading}
						onToggle={toggleDesktopDropdown}
						onClose={closeDesktopDropdown}
						onAvatarUpload={handleAvatarUpload}
						onLogout={handleLogout}
					/>
				) : (
					<Link href='/login' className='btn btn-primary btn-sm rounded-full'>
						Login
					</Link>
				)}
			</div>

			<MobileMenu
				isOpen={isMobileMenuOpen}
				user={me}
				loading={loading}
				isUploading={isUploading}
				onClose={() => setIsMobileMenuOpen(false)}
				onAvatarUpload={handleAvatarUpload}
				onLogout={handleLogout}
			/>
		</nav>
	);
}
