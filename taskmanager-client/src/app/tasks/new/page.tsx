'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import RequireAuth from '@/components/RequireAuth';
import { CreateTaskSchema, validateData, formatValidationErrors } from '@/lib/validation';

export default function NewTaskPage() {
	const [formData, setFormData] = useState({
		task: '',
		description: '',
		priority: 'Medium',
		status: 'Pending',
		dueDate: '',
		labels: '',
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);

		try {
			// Validate form data with Zod
			const validation = validateData(CreateTaskSchema, formData);
			
			if (!validation.success) {
				setErrors(formatValidationErrors(validation.errors));
				setLoading(false);
				toast.error('Please fix the errors below');
				return;
			}

			const taskData = validation.data;

			const res = await fetch('/api/taskman', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(taskData),
				credentials: 'include',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to create task');
			}

			const data = await res.json();

			// Show success toast
			toast.success('Task created successfully!');

			// Redirect to the new task
			router.push(`/tasks/${data.data._id}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to create task';
			setErrors({ general: msg });
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
						className={`input input-bordered w-full ${errors.task ? 'input-error' : ''}`}
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
						className={`textarea textarea-bordered w-full ${errors.description ? 'textarea-error' : ''}`}
						placeholder='Describe your task'
						rows={4}
					/>
					{errors.description && (
						<label className='label'>
							<span className='label-text-alt text-error'>{errors.description}</span>
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
						className={`input input-bordered w-full ${errors.dueDate ? 'input-error' : ''}`}
					/>
					{errors.dueDate && (
						<label className='label'>
							<span className='label-text-alt text-error'>{errors.dueDate}</span>
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
						className={`input input-bordered w-full ${errors.labels ? 'input-error' : ''}`}
						placeholder='Enter labels separated by commas'
					/>
					{errors.labels ? (
						<label className='label'>
							<span className='label-text-alt text-error'>{errors.labels}</span>
						</label>
					) : (
						<label className='label'>
							<span className='label-text-alt'>
								Separate multiple labels with commas (max 10 labels, 50 chars each)
							</span>
						</label>
					)}
				</div>

				{errors.general && (
					<div className='alert alert-error'>
						<FontAwesomeIcon icon={faExclamationTriangle} style={{ width: '18px', height: '18px' }} />
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
