// src/components/StatusBadge.tsx
import { useState } from 'react';
import type { Task } from '../types/task';
import { updateTask } from '../lib/tasks';
import { toastSuccess, toastError } from '../lib/toast';
import { getErrorMessage } from '../lib/getErrorMessage';

type Status = Task['status'] | 'Pending' | 'In Progress' | 'Completed';

const STATUS_OPTIONS: Status[] = ['Pending', 'In Progress', 'Completed'];

const statusStyles: Record<Status, { pill: string; dot: string }> = {
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
	initialStatus: Status;
	onUpdated?: (task: Task) => void;
};

export default function StatusBadge({
	taskId,
	initialStatus,
	onUpdated,
}: StatusBadgeProps) {
	const [status, setStatus] = useState<Status>(initialStatus || 'Pending');
	const [updating, setUpdating] = useState(false);
	const [open, setOpen] = useState(false);

	async function changeStatus(newStatus: Status) {
		if (newStatus === status) return;

		const previous = status;
		setStatus(newStatus);
		setUpdating(true);

		try {
			const updated = await updateTask(taskId, { status: newStatus });
			toastSuccess('Task status updated', 'statusUpdated');
			onUpdated?.(updated);
			setOpen(false);
		} catch (err) {
			setStatus(previous);
			const message = getErrorMessage(err);
			toastError(message || 'Failed to update status', 'statusError');
		} finally {
			setUpdating(false);
		}
	}

	function handleToggleComplete() {
		const nextStatus: Status = status === 'Completed' ? 'Pending' : 'Completed';
		void changeStatus(nextStatus);
		setOpen(false);
	}

	return (
		<div className='flex flex-wrap items-center gap-3'>
			{/* Pill-as-dropdown (custom, left-aligned) */}
			<div className='relative inline-block'>
				<button
					type='button'
					className={`whitespace-nowrap inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer focus:outline-none w-full ${
						statusStyles[status].pill
					} ${updating ? 'opacity-60 pointer-events-none' : ''}`}
					onClick={() => {
						if (updating) return;
						setOpen((prev) => !prev);
					}}>
					<span
						className={`h-2 w-2 rounded-full ${statusStyles[status].dot}`}
					/>
					<span>{status}</span>
				</button>

				{open && (
					<div className='absolute left-0 mt-2 z-20 bg-base-200 shadow-lg rounded-xl py-2 px-0 min-w-full'>
						<ul className='flex flex-col'>
							{STATUS_OPTIONS.map((option) => (
								<li key={option} className='my-1'>
									<button
										type='button'
										className={`flex whitespace-nowrap items-center gap-2 rounded-full px-3 py-1 text-xs font-medium w-full ${statusStyles[option].pill}`}
										onClick={() => changeStatus(option)}>
										<span
											className={`h-2 w-2 rounded-full ${statusStyles[option].dot}`}
										/>
										<span>{option}</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

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
