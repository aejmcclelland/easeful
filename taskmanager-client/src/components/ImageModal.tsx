'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface ImageData {
	public_id: string;
	url: string;
	width?: number;
	height?: number;
}

interface ImageModalProps {
	isOpen: boolean;
	onClose: () => void;
	images: ImageData[];
	currentIndex: number;
	onNext?: () => void;
	onPrevious?: () => void;
	title?: string;
}

export default function ImageModal({
	isOpen,
	onClose,
	images,
	currentIndex,
	onNext,
	onPrevious,
	title = 'Task Image'
}: ImageModalProps) {
	const currentImage = images[currentIndex];
	const hasMultipleImages = images.length > 1;

	// Handle keyboard navigation
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'Escape':
					onClose();
					break;
				case 'ArrowLeft':
					if (onPrevious) onPrevious();
					break;
				case 'ArrowRight':
					if (onNext) onNext();
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose, onNext, onPrevious]);

	// Lock body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isOpen || !currentImage) return null;

	// Generate optimized Cloudinary URL for large display
	const getOptimizedUrl = (url: string) => {
		return url.replace('/upload/', '/upload/w_1200,h_800,c_limit,q_auto,f_auto/');
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80'>
			{/* Backdrop - click to close */}
			<div 
				className='absolute inset-0 cursor-pointer'
				onClick={onClose}
			/>

			{/* Modal Content */}
			<div className='relative max-w-6xl max-h-[90vh] mx-4'>
				{/* Close Button */}
				<button
					onClick={onClose}
					className='absolute top-4 right-4 z-10 btn btn-circle btn-ghost bg-black bg-opacity-50 text-white hover:bg-opacity-70'>
					<FontAwesomeIcon icon={faTimes} />
				</button>

				{/* Large clickable areas for navigation */}
				{hasMultipleImages && onPrevious && currentIndex > 0 && (
					<div
						onClick={onPrevious}
						className='absolute left-0 top-0 w-1/4 h-full z-10 cursor-pointer flex items-center justify-start pl-4'>
						<div className='w-16 h-16 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110'>
							<FontAwesomeIcon icon={faChevronLeft} size="lg" />
						</div>
					</div>
				)}

				{hasMultipleImages && onNext && currentIndex < images.length - 1 && (
					<div
						onClick={onNext}
						className='absolute right-0 top-0 w-1/4 h-full z-10 cursor-pointer flex items-center justify-end pr-4'>
						<div className='w-16 h-16 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110'>
							<FontAwesomeIcon icon={faChevronRight} size="lg" />
						</div>
					</div>
				)}

				{/* Image */}
				<div className='relative'>
					<Image
						src={getOptimizedUrl(currentImage.url)}
						alt={title}
						width={1200}
						height={800}
						className='max-w-full max-h-[90vh] object-contain rounded-lg'
						priority
						unoptimized // Let Cloudinary handle optimization
					/>
				</div>

				{/* Image Info */}
				<div className='absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg'>
					<div className='flex justify-between items-center'>
						<h3 className='text-lg font-medium'>{title}</h3>
						{hasMultipleImages && (
							<span className='text-sm opacity-80'>
								{currentIndex + 1} of {images.length}
							</span>
						)}
					</div>
				</div>

				{/* Thumbnail Navigation (for multiple images) */}
				{hasMultipleImages && images.length <= 6 && (
					<div className='absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2'>
						{images.map((image, index) => (
							<button
								key={image.public_id}
								onClick={() => onNext && onPrevious && (
									index > currentIndex 
										? Array.from({ length: index - currentIndex }).forEach(() => onNext())
										: Array.from({ length: currentIndex - index }).forEach(() => onPrevious())
								)}
								className={`w-16 h-12 rounded border-2 overflow-hidden ${
									index === currentIndex ? 'border-primary' : 'border-white border-opacity-50'
								}`}>
								<img
									src={image.url.replace('/upload/', '/upload/w_60,h_45,c_fill,q_auto,f_auto/')}
									alt={`Thumbnail ${index + 1}`}
									className='w-full h-full object-cover'
								/>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}