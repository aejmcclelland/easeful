'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import type { Task } from '@/lib/types';
import RequireAuth from '@/components/RequireAuth';
import ImageUploadForm from '@/components/ImageUploadForm';
import { apiPost } from '@/lib/api';
import {
	CreateTaskSchema,
	validateData,
	formatValidationErrors,
} from '@/lib/validation';

export default function NewTaskPage() {
	const router = useRouter();

	const [formData, setFormData] = useState({
		task: '',
		description: '',
		priority: 'Medium',
		status: 'Pending',
		dueDate: '',
		labels: '',
	});
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);

		try {
			// Validate with Zod
			const validation = validateData(CreateTaskSchema, formData);
			if (!validation.success) {
				setErrors(formatValidationErrors(validation.errors));
				toast.error('Please fix the errors below');
				return;
			}

			const taskData = validation.data;

			// Build FormData (supports files)
			const fd = new FormData();

			// Append scalar fields
			if (taskData.task) fd.append('task', taskData.task);
			if (taskData.description) fd.append('description', taskData.description);
			if (taskData.priority) fd.append('priority', taskData.priority);
			if (taskData.status) fd.append('status', taskData.status);
			if (taskData.dueDate) fd.append('dueDate', taskData.dueDate);

			// Append labels as array items
			if (Array.isArray(taskData.labels)) {
				taskData.labels.forEach((l) => fd.append('labels[]', l));
			}

			// Append images
			selectedImages.forEach((file) => fd.append('images', file));

			// POST to Express via helper (credentials included inside helper)
			type CreateTaskResponse = { success: true; data: Task };

			const json = await apiPost<CreateTaskResponse>('/api/easeful', fd);

			toast.success('Task created successfully!');
			router.push(`/tasks/${json.data._id}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to create task';
			setErrors((prev) => ({ ...prev, general: msg }));
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<RequireAuth>
			<div className='max-w-2xl mx-auto p-4'>
				<div className='mb-6'>
					<Link href='/tasks' className='link link-hover text-sm'>
						{'\u2190'} Back to tasks
					</Link>
					<h1 className='text-2xl font-bold mt-2'>Create New Task</h1>
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
							className={`input input-bordered w-full ${
								errors.task ? 'input-error' : ''
							}`}
							placeholder='Enter task name'
							maxLength={150}
						/>
						{errors.task && (
							<label className='label'>
								<span className='label-text-alt text-error'>{errors.task}</span>
							</label>
						)}
					</div>

					<div className='form-control'>
						<label className='label'>
							<span className='label-text'>Description *</span>
						</label>
						<textarea
							name='description'
							value={formData.description}
							onChange={handleChange}
							className={`textarea textarea-bordered w-full ${
								errors.description ? 'textarea-error' : ''
							}`}
							placeholder='Describe your task'
							rows={4}
						/>
						{errors.description && (
							<label className='label'>
								<span className='label-text-alt text-error'>
									{errors.description}
								</span>
							</label>
						)}
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
							className={`input input-bordered w-full ${
								errors.dueDate ? 'input-error' : ''
							}`}
						/>
						{errors.dueDate && (
							<label className='label'>
								<span className='label-text-alt text-error'>
									{errors.dueDate}
								</span>
							</label>
						)}
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
							className={`input input-bordered w-full ${
								errors.labels ? 'input-error' : ''
							}`}
							placeholder='Enter labels separated by commas'
						/>
						{errors.labels ? (
							<label className='label'>
								<span className='label-text-alt text-error'>
									{errors.labels}
								</span>
							</label>
						) : (
							<label className='label'>
								<span className='label-text-alt'>
									Separate multiple labels with commas (max 10 labels, 50 chars
									each)
								</span>
							</label>
						)}
					</div>

					<ImageUploadForm
						selectedFiles={selectedImages}
						onFilesChange={setSelectedImages}
					/>

					{errors.general && (
						<div className='alert alert-error'>
							<span>{errors.general}</span>
						</div>
					)}

					<div className='flex gap-4'>
						<button
							type='submit'
							className='btn btn-primary flex-1'
							disabled={loading}>
							{loading ? 'Creating...' : 'Create Task'}
						</button>
						<Link href='/tasks' className='btn btn-ghost'>
							Cancel
						</Link>
					</div>
				</form>
			</div>
		</RequireAuth>
	);
}
