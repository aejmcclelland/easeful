import { useRef, useEffect } from 'react';
import Link from 'next/link';
import UserAvatar from './UserAvatar';
import type { User } from '@/lib/types';

interface DesktopUserMenuProps {
	user: User;
	isOpen: boolean;
	isUploading: boolean;
	onToggle: () => void;
	onClose: () => void;
	onAvatarUpload: (file: File) => void;
	onLogout: () => void;
}

export default function DesktopUserMenu({
	user,
	isOpen,
	isUploading,
	onToggle,
	onClose,
	onAvatarUpload,
	onLogout
}: DesktopUserMenuProps) {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

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

	return (
		<div className='relative' ref={dropdownRef}>
			<button
				onClick={onToggle}
				className='btn btn-ghost btn-circle avatar'>
				<UserAvatar user={user} />
			</button>
			
			{isOpen && (
				<div className='absolute right-0 top-12 z-50 bg-base-100 border border-base-300 shadow-xl rounded-lg min-w-52'>
					<div className='p-4 space-y-2'>
						<div className='px-2 py-1 text-sm font-medium text-base-content/70 border-b border-base-300 pb-2'>
							<i className='fas fa-user-tag mr-2'></i>
							{user.name || user.email}
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
									{user.avatar?.url ? 'Change Avatar' : 'Upload Avatar'}
								</>
							)}
						</button>
						<Link
							href='/profile'
							onClick={onClose}
							className='w-full text-left px-2 py-2 rounded-lg text-base-content hover:bg-base-200 transition-colors block'>
							<i className='fas fa-user-edit mr-3'></i>
							Edit Profile
						</Link>
						<button
							onClick={handleLogout}
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
	);
}