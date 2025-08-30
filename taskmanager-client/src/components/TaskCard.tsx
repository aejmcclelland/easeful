'use client';
import React from 'react';
import Link from 'next/link';
import { Task } from '@/lib/types';
import ImageModal from './ImageModal';
import { useImageModal } from '@/hooks/useImageModal';

interface TaskCardProps {
	task: Task;
	onDelete?: (taskId: string) => void;
	showDeleteButton?: boolean;
}

export default function TaskCard({
	task,
	onDelete,
	showDeleteButton = false,
}: TaskCardProps) {
	const { isOpen, currentIndex, openModal, closeModal, nextImage, previousImage, images } = useImageModal();
	const handleCardClick = (e: React.MouseEvent) => {
		// Don't navigate if clicking on action buttons or image thumbnails
		const target = e.target as HTMLElement;
		if (target.closest('.action-buttons') || target.closest('.image-thumbnail')) {
			return;
		}
		window.location.href = `/tasks/${task._id}`;
	};

	const handleImageClick = (e: React.MouseEvent, index: number) => {
		e.stopPropagation(); // Prevent card click
		if (task.images && task.images.length > 0) {
			openModal(task.images, index);
		}
	};

	return (
		<div className='relative'>
			<div 
				className='card bg-base-100 border shadow-sm hover:shadow-md transition cursor-pointer'
				onClick={handleCardClick}>
				<div className='card-body'>
					<div className='flex justify-between items-start'>
						<h2 className='card-title'>{task.task}</h2>
						<div className='flex flex-col items-end gap-2'>
							<div className='badge badge-accent'>
								<i className='fas fa-circle mr-1'></i>
								{task.status ?? 'Open'}
							</div>
							{/* Sharing indicators */}
							{task.isPublic && (
								<div className='badge badge-info badge-sm'>
									<i className='fas fa-globe mr-1'></i>
									Public
								</div>
							)}
							{task.sharedWith && task.sharedWith.length > 0 && (
								<div className='badge badge-warning badge-sm'>
									<i className='fas fa-share-alt mr-1'></i>
									Shared
								</div>
							)}
						</div>
					</div>
					<p className='text-base-content/70'>
						<i className='fas fa-align-left mr-2 opacity-60'></i>
						{task.description ?? 'No description'}
					</p>
					<div className='flex flex-wrap gap-2 mt-2'>
						{task.priority && (
							<div className='badge badge-outline badge-secondary'>
								<i className='fas fa-flag mr-1'></i>
								{task.priority}
							</div>
						)}
						{task.labels?.map((label) => (
							<div key={label} className='badge badge-outline'>
								<i className='fas fa-tag mr-1'></i>
								{label}
							</div>
						))}
					</div>
					{task.dueDate && (
						<p
							className='text-sm text-base-content/60 mt-2'
							suppressHydrationWarning>
							<i className='fas fa-calendar-alt mr-2'></i>
							Due:{' '}
							{new Intl.DateTimeFormat('en-GB', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
								timeZone: 'UTC',
							}).format(new Date(task.dueDate))}
						</p>
					)}

					{/* Image thumbnails */}
					{task.images && task.images.length > 0 && (
						<div className='flex gap-1 mt-2'>
							{task.images.slice(0, 3).map((image, index) => (
								<div 
									key={image.public_id || index} 
									className='relative image-thumbnail cursor-pointer hover:opacity-80 transition-opacity'
									onClick={(e) => handleImageClick(e, index)}
								>
									<img
										src={image.url.replace('/upload/', '/upload/w_60,h_45,c_fill,q_auto,f_auto/')}
										alt={`Task image ${index + 1}`}
										className='w-15 h-11 object-cover rounded border'
									/>
								</div>
							))}
							{task.images.length > 3 && (
								<div 
									className='w-15 h-11 bg-base-200 rounded border flex items-center justify-center image-thumbnail cursor-pointer hover:opacity-80 transition-opacity'
									onClick={(e) => handleImageClick(e, 3)}
								>
									<span className='text-xs text-base-content/70'>
										+{task.images.length - 3}
									</span>
								</div>
							)}
						</div>
					)}

					{/* Action buttons positioned in bottom-right corner of card-body */}
					{showDeleteButton && (
						<div className='flex justify-end gap-2 mt-4 action-buttons'>
							<Link
								href={`/tasks/${task._id}/edit`}
								className='btn btn-primary btn-xs rounded-full'>
								<i className='fas fa-edit'></i>
							</Link>
							{onDelete && (
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										onDelete(task._id);
									}}
									className='btn btn-error btn-xs rounded-full'>
									<i className='fas fa-trash'></i>
								</button>
							)}
						</div>
					)}
				</div>
			</div>
			
			{/* Image Modal */}
			<ImageModal
				isOpen={isOpen}
				onClose={closeModal}
				images={images}
				currentIndex={currentIndex}
				onNext={nextImage}
				onPrevious={previousImage}
				title={task.task}
			/>
		</div>
	);
}
