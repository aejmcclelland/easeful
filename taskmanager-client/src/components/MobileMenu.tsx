import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import UserAvatar from './UserAvatar';
import type { User } from '@/lib/types';

interface MobileMenuProps {
	isOpen: boolean;
	user: User | null;
	loading: boolean;
	isUploading: boolean;
	onClose: () => void;
	onAvatarUpload: (file: File) => void;
	onLogout: () => void;
}

export default function MobileMenu({
	isOpen,
	user,
	loading,
	isUploading,
	onClose,
	onAvatarUpload,
	onLogout
}: MobileMenuProps) {
	const [mounted, setMounted] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => setMounted(true), []);

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && file.type.startsWith('image/')) {
			onAvatarUpload(file);
		}
		// Reset the file input
		if (event.target) {
			event.target.value = '';
		}
	};

	const handleLogout = () => {
		onLogout();
		onClose();
	};

	const handleLinkClick = () => {
		onClose();
	};

	if (!mounted || !isOpen) {
		return null;
	}

	return createPortal(
		<div className='fixed inset-0 z-[9999] lg:hidden'>
			{/* Backdrop covering the whole viewport */}
			<div
				className='absolute inset-0 bg-base-100/80 backdrop-blur-sm'
				onClick={onClose}
			/>

			{/* Menu panel below the navbar height (approx 4rem = top-16) */}
			<div className='absolute top-16 left-0 right-0 bg-base-100 border-b border-base-300 shadow-xl'>
				<div className='p-4 space-y-3'>
					{/* Mobile Navigation Links */}
					<div className='space-y-2'>
						<Link
							href='/tasks'
							className='block w-full text-left px-4 py-2 rounded-lg hover:bg-base-200 transition-colors'
							onClick={handleLinkClick}>
							<i className='fas fa-tasks mr-3'></i>
							Tasks
						</Link>
						<Link
							href='/tasks/new'
							className='block w-full text-left px-4 py-2 rounded-lg hover:bg-base-200 transition-colors'
							onClick={handleLinkClick}>
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
						) : user ? (
							<div className='space-y-2'>
								<div className='flex items-center px-4 py-2'>
									<UserAvatar user={user} size='sm' className='mr-3' />
									<span className='text-sm font-medium text-base-content/70'>
										{user.name || user.email}
									</span>
								</div>
								<button
									onClick={() => {
										triggerFileInput();
										onClose();
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
											{user.avatar?.url ? 'Change Avatar' : 'Upload Avatar'}
										</>
									)}
								</button>
								<Link
									href='/profile'
									onClick={handleLinkClick}
									className='block w-full text-left px-4 py-2 rounded-lg text-base-content hover:bg-base-200 transition-colors'>
									<i className='fas fa-user-edit mr-3'></i>
									Edit Profile
								</Link>
								<button
									onClick={handleLogout}
									className='block w-full text-left px-4 py-2 rounded-lg text-base-content hover:bg-error hover:text-error-content transition-colors'>
									<i className='fas fa-sign-out-alt mr-3'></i>
									Logout
								</button>
							</div>
						) : (
							<Link
								href='/login'
								className='block w-full text-left px-4 py-2 rounded-lg bg-accent text-base-content hover:bg-error transition-colors'
								onClick={handleLinkClick}>
								<i className='fas fa-sign-in-alt mr-3'></i>
								Login
							</Link>
						)}
					</div>
				</div>
			</div>

			<input
				ref={fileInputRef}
				type='file'
				accept='image/*'
				onChange={handleFileChange}
				className='hidden'
			/>
		</div>,
		document.body
	);
}