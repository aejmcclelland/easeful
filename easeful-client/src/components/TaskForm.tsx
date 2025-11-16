import { useState } from 'react';
import type { Task } from '../types/task';
import { createTask } from '../lib/tasks';
import { getErrorMessage } from '../lib/getErrorMessage';
import { toastSuccess, toastError } from '../lib/toast';


type TaskFormProps = {
	onTaskCreated?: (task: Task) => void;
};

const initialForm: Task = {
	task: '',
	description: '',
	priority: 'Medium',
	quickDue: 'none',
	repeat: 'none',
	timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
	// dueDate, repeatCount etc if your Task type has them:
	// dueDate: undefined,
	// repeatCount: 1,
};

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
	const [form, setForm] = useState<Task>(initialForm);
	const [submitting, setSubmitting] = useState(false);

	const showDateInput = form.quickDue === 'date';

	function update<K extends keyof Task>(key: K, value: Task[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const created = await createTask(form);

			toastSuccess('Task created successfully', 'createTaskSuccess');

			setForm(initialForm); // reset form

			if (onTaskCreated) {
				onTaskCreated(created);
			}
		} catch (err) {
			const message = getErrorMessage(err);
			toastError(message || 'Failed to create task', 'createTaskError');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='card bg-base-100 shadow p-6 space-y-4'>
			<h2 className='card-title'>Create Task</h2>

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
					<select
						className='select select-bordered'
						value={form.priority}
						onChange={(e) =>
							update('priority', e.target.value as Task['priority'])
						}>
						<option>Low</option>
						<option>Medium</option>
						<option>High</option>
					</select>
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

			<div className='card-actions justify-end'>
				<button className='btn btn-primary' disabled={submitting}>
					{submitting ? (
						<span className='loading loading-spinner loading-sm' />
					) : (
						'Create task'
					)}
				</button>
			</div>
		</form>
	);
}
