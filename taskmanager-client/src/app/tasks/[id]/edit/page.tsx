'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import RequireAuth from '@/components/RequireAuth';
import ImageUploadForm from '@/components/ImageUploadForm';
import type { Task } from '@/lib/types';

export default function EditTaskPage() {
	const API = process.env.NEXT_PUBLIC_API_BASE!;

	const [formData, setFormData] = useState({
		task: '',
		description: '',
		priority: 'Medium',
		status: 'Pending',
		dueDate: '',
		labels: '',
	});
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [existingImages, setExistingImages] = useState<
		{ public_id: string; url: string }[]
	>([]);
	const [loading, setLoading] = useState(false);
	const [fetchingTask, setFetchingTask] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const params = useParams();
	const taskId = params.id as string;

	useEffect(() => {
		const fetchTask = async () => {
			try {
				setFetchingTask(true);
				const res = await fetch(`/api/easeful/${taskId}`, {
					credentials: 'include',
				});

				if (!res.ok) {
					throw new Error('Failed to fetch task');
				}

				const data = await res.json();
				const task: Task = data.data;

				// Convert task data to form format
				setFormData({
					task: task.task || '',
					description: task.description || '',
					priority: task.priority || 'Medium',
					status: task.status || 'Pending',
					dueDate: task.dueDate
						? new Date(task.dueDate).toISOString().split('T')[0]
						: '',
					labels: task.labels ? task.labels.join(', ') : '',
				});

				// Set existing images
				setExistingImages(task.images || []);
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Failed to fetch task';
				setError(msg);
				toast.error(msg);
			} finally {
				setFetchingTask(false);
			}
		};

		if (taskId) {
			fetchTask();
		}
	}, [taskId]);

	const handleDeleteImage = async (publicId: string) => {
		try {
			const encodedPublicId = encodeURIComponent(publicId);
			const res = await fetch(
				`/api/easeful/${taskId}/photo/${encodedPublicId}`,
				{
					method: 'DELETE',
					credentials: 'include',
				}
			);

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to delete image');
			}

			// Remove from local state
			setExistingImages((prev) =>
				prev.filter((img) => img.public_id !== publicId)
			);
			toast.success('Image deleted successfully');
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to delete image';
			toast.error(msg);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			// Convert labels string to array
			const labelsArray = formData.labels
				.split(',')
				.map((label) => label.trim())
				.filter((label) => label.length > 0);

			const taskData = {
				...formData,
				labels: labelsArray,
				dueDate: formData.dueDate || undefined,
			};

			// First, update the task data with JSON
			const res = await fetch(`${API}/api/easeful/${taskId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(taskData),
				credentials: 'include',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to update task');
			}

			// If there are new images, upload them separately
			if (selectedImages.length > 0) {
				// Validate files before upload
				const validFiles = selectedImages.filter(
					(file) => file && file instanceof File && file.size > 0
				);

				if (validFiles.length === 0) {
					// No valid files to upload, skip
				} else {
					const imageFormData = new FormData();
					validFiles.forEach((file) => {
						imageFormData.append('images', file);
					});

					const imageRes = await fetch(`${API}/api/easeful${taskId}/photo`, {
						method: 'PUT',
						body: imageFormData,
						credentials: 'include',
					});

					if (!imageRes.ok) {
						const errorData = await imageRes.json();
						throw new Error(errorData.error || 'Failed to upload images');
					}
				}
			}

			// Show success toast
			toast.success('Task updated successfully!');

			// Redirect back to tasks list
			router.push('/tasks');
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to update task';
			setError(msg);
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	if (fetchingTask) {
		return (
			<div className='max-w-2xl mx-auto p-4'>
				<div className='flex justify-center items-center py-12'>
					<div className='loading loading-spinner loading-lg'></div>
					<span className='ml-3 text-lg'>Loading task...</span>
				</div>
			</div>
		);
	}

	if (error && fetchingTask === false) {
		return (
			<div className='max-w-2xl mx-auto p-4'>
				<div className='alert alert-error'>
					<FontAwesomeIcon
						icon={faExclamationTriangle}
						style={{ width: '18px', height: '18px' }}
					/>
					<span>{error}</span>
				</div>
				<Link href='/tasks' className='btn btn-primary mt-4 rounded-full'>
					{'\u2190'} Back to tasks
				</Link>
			</div>
		);
	}

	return (
		<RequireAuth>
			<div className='max-w-2xl mx-auto p-4'>
				<div className='mb-6'>
					<Link href='/tasks' className='link link-hover text-sm'>
						{'\u2190'} Back to tasks
					</Link>
					<h1 className='text-2xl font-bold mt-2'>Edit Task</h1>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='form-control'>
						<label className='label'>
							<span className='label-text'>Task Name *</span>
						</label>
						<input
							type='text'
							name='task'
							value={formData.task}
							onChange={handleChange}
							className='input input-bordered w-full'
							placeholder='Enter task name'
							required
							maxLength={150}
						/>
					</div>

					<div className='form-control'>
						<label className='label'>
							<span className='label-text'>Description *</span>
						</label>
						<textarea
							name='description'
							value={formData.description}
							onChange={handleChange}
							className='textarea textarea-bordered w-full'
							placeholder='Describe your task'
							required
							rows={4}
						/>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='form-control'>
							<label className='label'>
								<span className='label-text'>Priority</span>
							</label>
							<select
								name='priority'
								value={formData.priority}
								onChange={handleChange}
								className='select select-bordered w-full'>
								<option value='Low'>Low</option>
								<option value='Medium'>Medium</option>
								<option value='High'>High</option>
							</select>
						</div>

						<div className='form-control'>
							<label className='label'>
								<span className='label-text'>Status</span>
							</label>
							<select
								name='status'
								value={formData.status}
								onChange={handleChange}
								className='select select-bordered w-full'>
								<option value='Pending'>Pending</option>
								<option value='In Progress'>In Progress</option>
								<option value='Completed'>Completed</option>
							</select>
						</div>
					</div>

					<div className='form-control'>
						<label className='label'>
							<span className='label-text'>Due Date</span>
						</label>
						<input
							type='date'
							name='dueDate'
							value={formData.dueDate}
							onChange={handleChange}
							className='input input-bordered w-full'
						/>
					</div>

					<div className='form-control'>
						<label className='label'>
							<span className='label-text'>Labels</span>
						</label>
						<input
							type='text'
							name='labels'
							value={formData.labels}
							onChange={handleChange}
							className='input input-bordered w-full'
							placeholder='Enter labels separated by commas'
						/>
						<label className='label'>
							<span className='label-text-alt'>
								Separate multiple labels with commas
							</span>
						</label>
					</div>

					{/* Image Upload */}
					<ImageUploadForm
						selectedFiles={selectedImages}
						onFilesChange={setSelectedImages}
						existingImages={existingImages}
						onDeleteExisting={handleDeleteImage}
					/>

					{error && (
						<div className='alert alert-error'>
							<FontAwesomeIcon
								icon={faExclamationTriangle}
								style={{ width: '18px', height: '18px' }}
							/>
							<span>{error}</span>
						</div>
					)}

					<div className='flex gap-4'>
						<button
							type='submit'
							className='btn btn-primary flex-1 rounded-full'
							disabled={loading}>
							{loading ? 'Updating...' : 'Update Task'}
						</button>
						<Link href='/tasks' className='btn btn-ghost rounded-full'>
							Cancel
						</Link>
					</div>
				</form>
			</div>
		</RequireAuth>
	);
}
