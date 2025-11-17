import { useState, useEffect } from 'react';
import type { Task } from '../types/task';
import { createTask, updateTask } from '../lib/tasks';
import { getErrorMessage } from '../lib/getErrorMessage';
import { toastSuccess, toastError } from '../lib/toast';
import PriorityBadge from './PriorityBadge';

type TaskFormProps = {
	onTaskCreated?: (task: Task) => void;
	onTaskUpdated?: (task: Task) => void;
	onCancelEdit?: () => void;
	editingTask?: Task | null;
};

const initialForm: Task = {
	task: '',
	description: '',
	priority: 'Medium',
	quickDue: 'none',
	repeat: 'none',
	timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
	// Optional fields like dueDate, repeatCount, etc., if present in Task:
	// dueDate: undefined,
	// repeatCount: 1,
};

export default function TaskForm({
	onTaskCreated,
	onTaskUpdated,
	onCancelEdit,
	editingTask,
}: TaskFormProps) {
	const [form, setForm] = useState<Task>(editingTask ?? initialForm);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (editingTask) {
			setForm(editingTask);
		} else {
			setForm(initialForm);
		}
	}, [editingTask]);

	const showDateInput = form.quickDue === 'date';

	function update<K extends keyof Task>(key: K, value: Task[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			if (editingTask && editingTask._id) {
				const updated = await updateTask(editingTask._id, form);
				toastSuccess('Task updated successfully', 'updateTaskSuccess');

				if (onTaskUpdated) {
					onTaskUpdated(updated);
				}
				onCancelEdit?.();
			} else {
				const created = await createTask(form);
				toastSuccess('Task created successfully', 'createTaskSuccess');

				setForm(initialForm);

				if (onTaskCreated) {
					onTaskCreated(created);
				}
			}
		} catch (err) {
			const message = getErrorMessage(err);
			const fallback = editingTask
				? 'Failed to update task'
				: 'Failed to create task';
			toastError(
				message || fallback,
				editingTask ? 'updateTaskError' : 'createTaskError'
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='card bg-base-100 shadow p-6 space-y-4'>
			<h2 className='card-title'>
				{editingTask ? 'Edit Task' : 'Create Task'}
			</h2>

			<div className='form-control'>
				<label className='label'>
					<span className='label-text'>Title</span>
				</label>
				<input
					className='input input-bordered'
					placeholder='e.g., Book MOT'
					value={form.task}
					onChange={(e) => update('task', e.target.value)}
					maxLength={150}
					required
				/>
			</div>

			<div className='form-control'>
				<label className='label'>
					<span className='label-text'>Description</span>
				</label>
				<textarea
					className='textarea textarea-bordered'
					placeholder='Details…'
					value={form.description}
					onChange={(e) => update('description', e.target.value)}
					rows={3}
				/>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div className='form-control'>
					<label className='label'>
						<span className='label-text'>Priority</span>
					</label>
					<PriorityBadge
						priority={form.priority}
						editable
						onChange={(newPriority) => update('priority', newPriority)}
					/>
				</div>

				<div className='form-control'>
					<label className='label'>
						<span className='label-text'>Quick due</span>
					</label>
					<select
						className='select select-bordered'
						value={form.quickDue}
						onChange={(e) =>
							update('quickDue', e.target.value as Task['quickDue'])
						}>
						<option value='none'>None</option>
						<option value='today'>Today</option>
						<option value='tomorrow'>Tomorrow</option>
						<option value='date'>Pick date…</option>
					</select>
				</div>
			</div>

			{showDateInput && (
				<div className='form-control'>
					<label className='label'>
						<span className='label-text'>Due date</span>
					</label>
					<input
						type='datetime-local'
						className='input input-bordered'
						value={form.dueDate || ''}
						onChange={(e) => update('dueDate', e.target.value)}
					/>
				</div>
			)}

			<div className='form-control'>
				<label className='label'>
					<span className='label-text'>Repeat</span>
				</label>
				<select
					className='select select-bordered'
					value={form.repeat}
					onChange={(e) => update('repeat', e.target.value as Task['repeat'])}>
					<option value='none'>No repeat</option>
					<option value='daily'>Daily</option>
					<option value='weekdays'>Weekdays (Mon–Fri)</option>
					<option value='weekly'>Weekly</option>
					<option value='monthly'>Monthly</option>
					<option value='custom'>Custom (RRULE)</option>
				</select>
			</div>

			{form.repeat === 'custom' && (
				<div className='form-control'>
					<label className='label'>
						<span className='label-text'>Custom RRULE</span>
					</label>
					<input
						className='input input-bordered'
						placeholder='e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR'
						value={form.repeatRule || ''}
						onChange={(e) => update('repeatRule', e.target.value)}
					/>
				</div>
			)}

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div className='form-control'>
					<label className='label'>
						<span className='label-text'>Repeat until (optional)</span>
					</label>
					<input
						type='date'
						className='input input-bordered'
						value={form.repeatUntil || ''}
						onChange={(e) => update('repeatUntil', e.target.value)}
					/>
				</div>

				<div className='form-control'>
					<label className='label'>
						<span className='label-text'>Repeat count (optional)</span>
					</label>
					<input
						type='number'
						min={1}
						className='input input-bordered'
						value={form.repeatCount || ''}
						onChange={(e) => update('repeatCount', Number(e.target.value))}
					/>
				</div>
			</div>

			<div className='card-actions justify-between items-center'>
				{editingTask && onCancelEdit && (
					<button
						type='button'
						className='btn btn-secondary'
						onClick={onCancelEdit}
						disabled={submitting}>
						Cancel
					</button>
				)}

				<button type='submit' className='btn btn-primary' disabled={submitting}>
					{submitting ? (
						<span className='loading loading-spinner loading-sm' />
					) : editingTask ? (
						'Save changes'
					) : (
						'Create task'
					)}
				</button>
			</div>
		</form>
	);
}
