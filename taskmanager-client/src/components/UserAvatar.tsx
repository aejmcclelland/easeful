import Image from 'next/image';
import type { User } from '@/lib/types';

interface UserAvatarProps {
	user: User;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
	const sizeClasses = {
		sm: 'w-8 h-8',
		md: 'w-10 h-10', 
		lg: 'w-16 h-16'
	};

	const iconSizes = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-lg'
	};

	return (
		<div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
			{user.avatar?.url ? (
				<Image 
					src={user.avatar.url}
					alt={user.name || user.email}
					className='w-full h-full object-cover'
					width={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
					height={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
				/>
			) : (
				<div className='w-full h-full bg-primary flex items-center justify-center'>
					<i className={`fas fa-user ${iconSizes[size]} text-primary-content`}></i>
				</div>
			)}
		</div>
	);
}