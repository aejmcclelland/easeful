// src/components/statusBadge.tsx
import { useState } from 'react';
import type { Task, TaskStatus } from '../types/task';
import { updateTask } from '../lib/tasks';
import { toastSuccess, toastError } from '../lib/toast';
import { getErrorMessage } from '../lib/getErrorMessage';
import { PillDropdown, type PillDropdownOption } from './PillDropdown';

const statusStyles: Record<TaskStatus, { pill: string; dot: string }> = {
	Pending: {
		pill: 'bg-yellow-100 text-yellow-900 border border-yellow-200',
		dot: 'bg-yellow-500',
	},
	'In Progress': {
		pill: 'bg-blue-100 text-blue-900 border border-blue-200',
		dot: 'bg-blue-500',
	},
	Completed: {
		pill: 'bg-green-100 text-green-900 border border-green-200',
		dot: 'bg-green-500',
	},
};

type StatusBadgeProps = {
	taskId: string;
	initialStatus: TaskStatus;
	onUpdated?: (task: Task) => void;
};

const STATUS_OPTIONS: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

export default function StatusBadge({
	taskId,
	initialStatus,
	onUpdated,
}: StatusBadgeProps) {
	const [status, setStatus] = useState<TaskStatus>(initialStatus || 'Pending');
	const [updating, setUpdating] = useState(false);

	async function changeStatus(newStatus: TaskStatus) {
		if (newStatus === status) return;

		const previous = status;
		setStatus(newStatus);
		setUpdating(true);

		try {
			const updated = await updateTask(taskId, { status: newStatus });
			toastSuccess('Task status updated', 'statusUpdated');
			onUpdated?.(updated);
		} catch (err) {
			setStatus(previous);
			const message = getErrorMessage(err);
			toastError(message || 'Failed to update status', 'statusError');
		} finally {
			setUpdating(false);
		}
	}

	function handleToggleComplete() {
		const nextStatus: TaskStatus =
			status === 'Completed' ? 'Pending' : 'Completed';
		void changeStatus(nextStatus);
	}

	const pillOptions: PillDropdownOption<TaskStatus>[] = STATUS_OPTIONS.map(
		(value) => ({
			value,
			label: value,
			pillClass: statusStyles[value].pill,
			icon: (
				<span className={`h-2 w-2 rounded-full ${statusStyles[value].dot}`} />
			),
		})
	);

	return (
		<div className='flex flex-wrap items-center gap-3'>
			{/* Status pill dropdown */}
			<PillDropdown<TaskStatus>
				value={status}
				options={pillOptions}
				disabled={updating}
				onChange={(val) => {
					void changeStatus(val);
				}}
			/>
			{/* Mark complete / Undo button */}
			<button
				type='button'
				className={`btn btn-xs ${
					status === 'Completed' ? 'btn-outline' : 'btn-success'
				}`}
				onClick={handleToggleComplete}
				disabled={updating}>
				{status === 'Completed' ? 'Undo' : 'Mark complete'}
			</button>
		</div>
	);
}
