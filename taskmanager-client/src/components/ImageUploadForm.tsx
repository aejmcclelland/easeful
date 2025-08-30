'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import ImageModal from './ImageModal';
import { useImageModal } from '@/hooks/useImageModal';

interface ImageUploadFormProps {
	selectedFiles: File[];
	onFilesChange: (files: File[]) => void;
	maxImages?: number;
	existingImages?: { public_id: string; url: string }[];
	onDeleteExisting?: (publicId: string) => void;
}

export default function ImageUploadForm({ 
	selectedFiles, 
	onFilesChange, 
	maxImages = 6,
	existingImages = [],
	onDeleteExisting 
}: ImageUploadFormProps) {
	const [dragOver, setDragOver] = useState(false);
	const { isOpen, currentIndex, openModal, closeModal, nextImage, previousImage, images } = useImageModal();

	const totalImages = existingImages.length + selectedFiles.length;
	const canAddMore = totalImages < maxImages;
	const remainingSlots = maxImages - totalImages;

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		processFiles(files);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const files = Array.from(e.dataTransfer.files);
		processFiles(files);
	};

	const processFiles = (files: File[]) => {
		// Validate file count
		if (files.length > remainingSlots) {
			alert(`Can only add ${remainingSlots} more images`);
			return;
		}

		// Validate file types and sizes
		const validFiles = files.filter(file => {
			const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
			const maxSize = 10 * 1024 * 1024; // 10MB

			if (!validTypes.includes(file.type)) {
				alert(`${file.name}: Invalid file type. Use JPEG, PNG, WebP, or GIF`);
				return false;
			}

			if (file.size > maxSize) {
				alert(`${file.name}: File too large. Max 10MB`);
				return false;
			}

			return true;
		});

		onFilesChange([...selectedFiles, ...validFiles]);
	};

	const removeFile = (index: number) => {
		const newFiles = selectedFiles.filter((_, i) => i !== index);
		onFilesChange(newFiles);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
	};

	const handleImageClick = (index: number) => {
		if (existingImages.length > 0) {
			openModal(existingImages, index);
		}
	};

	return (
		<div className='form-control'>
			<label className='label'>
				<span className='label-text'>
					Task Images ({totalImages}/{maxImages} used)
				</span>
			</label>

			{/* Existing Images */}
			{existingImages.length > 0 && (
				<div className='mb-4'>
					<p className='text-sm font-medium mb-2'>Current Images:</p>
					<div className='grid grid-cols-3 gap-2'>
						{existingImages.map((image, index) => (
							<div key={image.public_id} className='relative group'>
								<img
									src={image.url.replace('/upload/', '/upload/w_120,h_90,c_fill,q_auto,f_auto/')}
									alt='Task image'
									className='w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity'
									onClick={() => handleImageClick(index)}
								/>
								{onDeleteExisting && (
									<button
										type='button'
										onClick={() => onDeleteExisting(image.public_id)}
										className='absolute top-1 right-1 btn btn-error btn-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10'>
										<FontAwesomeIcon icon={faTimes} style={{ width: '10px', height: '10px' }} />
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Upload Area */}
			{canAddMore && (
				<div
					className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
						dragOver 
							? 'border-primary bg-primary/10' 
							: 'border-base-300 hover:border-primary/50'
					}`}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}>
					
					<FontAwesomeIcon icon={faUpload} style={{ width: '24px', height: '24px', marginBottom: '8px' }} className='text-base-content/50' />
					<p className='text-sm text-base-content/70 mb-2'>
						Drop images here or click to select
					</p>
					<input
						type='file'
						multiple
						accept='image/jpeg,image/png,image/webp,image/gif'
						onChange={handleFileSelect}
						className='file-input file-input-bordered file-input-sm w-full max-w-xs'
					/>
					<p className='text-xs text-base-content/50 mt-2'>
						JPEG, PNG, WebP, GIF up to 10MB each. Max {remainingSlots} more images.
					</p>
				</div>
			)}

			{/* Selected Files Preview */}
			{selectedFiles.length > 0 && (
				<div className='mt-4'>
					<p className='text-sm font-medium mb-2'>Selected Files:</p>
					<div className='grid grid-cols-3 gap-2'>
						{selectedFiles.map((file, index) => (
							<div key={index} className='relative group'>
								<div className='w-full h-20 bg-base-200 rounded border flex flex-col items-center justify-center'>
									<FontAwesomeIcon icon={faImage} style={{ width: '16px', height: '16px' }} className='mb-1' />
									<span className='text-xs truncate max-w-full px-1'>{file.name}</span>
									<span className='text-xs opacity-60'>
										{(file.size / 1024 / 1024).toFixed(1)}MB
									</span>
								</div>
								<button
									type='button'
									onClick={() => removeFile(index)}
									className='absolute top-1 right-1 btn btn-error btn-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
									<FontAwesomeIcon icon={faTimes} style={{ width: '10px', height: '10px' }} />
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{!canAddMore && (
				<div className='alert alert-info mt-2'>
					<FontAwesomeIcon icon={faImage} style={{ width: '18px', height: '18px' }} />
					<span>Maximum {maxImages} images reached</span>
				</div>
			)}

			{/* Image Modal */}
			<ImageModal
				isOpen={isOpen}
				onClose={closeModal}
				images={images}
				currentIndex={currentIndex}
				onNext={nextImage}
				onPrevious={previousImage}
				title='Task Image'
			/>
		</div>
	);
}