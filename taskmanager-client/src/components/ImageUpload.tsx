'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faImage, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ImageUploadProps {
	taskId: string;
	currentImages?: { public_id: string; url: string; width?: number; height?: number; bytes?: number }[];
	onUploadSuccess: () => void;
	maxImages?: number;
}

export default function ImageUpload({ 
	taskId, 
	currentImages = [], 
	onUploadSuccess, 
	maxImages = 6 
}: ImageUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const currentCount = currentImages.length;
	const canUpload = currentCount < maxImages;
	const remainingSlots = maxImages - currentCount;

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		
		// Validate file count
		if (files.length > remainingSlots) {
			toast.error(`Can only upload ${remainingSlots} more images`);
			return;
		}

		// Validate file types and sizes
		const validFiles = files.filter(file => {
			const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
			const maxSize = 10 * 1024 * 1024; // 10MB

			if (!validTypes.includes(file.type)) {
				toast.error(`${file.name}: Invalid file type. Use JPEG, PNG, WebP, or GIF`);
				return false;
			}

			if (file.size > maxSize) {
				toast.error(`${file.name}: File too large. Max 10MB`);
				return false;
			}

			return true;
		});

		setSelectedFiles(validFiles);
	};

	const handleUpload = async () => {
		if (selectedFiles.length === 0) return;

		setUploading(true);
		
		try {
			const formData = new FormData();
			selectedFiles.forEach(file => {
				formData.append('images', file);
			});

			const res = await fetch(`/api/taskman/${taskId}/photo`, {
				method: 'PUT',
				body: formData,
				credentials: 'include',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Upload failed');
			}

			const data = await res.json();
			toast.success(`${data.count} image(s) uploaded successfully!`);
			
			// Clear selection and reset input
			setSelectedFiles([]);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			
			// Notify parent component
			onUploadSuccess();
			
		} catch (error) {
			console.error('Upload error:', error);
			const message = error instanceof Error ? error.message : 'Upload failed';
			toast.error(message);
		} finally {
			setUploading(false);
		}
	};

	const clearSelection = () => {
		setSelectedFiles([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	if (!canUpload) {
		return (
			<div className='alert alert-info'>
				<FontAwesomeIcon icon={faImage} style={{ width: '18px', height: '18px' }} />
				<span>Maximum {maxImages} images reached</span>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			<div className='form-control'>
				<label className='label'>
					<span className='label-text'>
						Upload Images ({currentCount}/{maxImages} used)
					</span>
				</label>
				
				<input
					ref={fileInputRef}
					type='file'
					multiple
					accept='image/jpeg,image/png,image/webp,image/gif'
					onChange={handleFileSelect}
					className='file-input file-input-bordered w-full'
					disabled={uploading}
				/>
				
				<label className='label'>
					<span className='label-text-alt'>
						JPEG, PNG, WebP, GIF up to 10MB each. Max {remainingSlots} more images.
					</span>
				</label>
			</div>

			{/* Preview selected files */}
			{selectedFiles.length > 0 && (
				<div className='space-y-2'>
					<div className='flex items-center justify-between'>
						<span className='text-sm font-medium'>
							{selectedFiles.length} file(s) selected
						</span>
						<button
							onClick={clearSelection}
							className='btn btn-ghost btn-xs'
							disabled={uploading}>
							<FontAwesomeIcon icon={faTimes} />
							Clear
						</button>
					</div>
					
					<div className='flex flex-wrap gap-2'>
						{selectedFiles.map((file, index) => (
							<div key={index} className='flex items-center gap-2 bg-base-200 rounded px-2 py-1'>
								<FontAwesomeIcon icon={faImage} style={{ width: '14px', height: '14px' }} />
								<span className='text-xs truncate max-w-32'>{file.name}</span>
								<span className='text-xs opacity-60'>
									{(file.size / 1024 / 1024).toFixed(1)}MB
								</span>
							</div>
						))}
					</div>

					<button
						onClick={handleUpload}
						disabled={uploading}
						className='btn btn-primary btn-sm w-full'>
						{uploading ? (
							<>
								<div className='loading loading-spinner loading-sm'></div>
								Uploading...
							</>
						) : (
							<>
								<FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} />
								Upload {selectedFiles.length} Image(s)
							</>
						)}
					</button>
				</div>
			)}
		</div>
	);
}