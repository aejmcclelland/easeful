// src/components/TaskCard.tsx
import type { Task } from '../types/task';
import { deleteTask } from '../lib/tasks';
import { useState } from 'react';
import { getErrorMessage } from '../lib/getErrorMessage';
import { toastSuccess, toastError } from '../lib/toast';

type TaskCardProps = {
	task: Task;
	onDeleted?: (id: string) => void;
};

export default function TaskCard({ task, onDeleted }: TaskCardProps) {
	const [deleting, setDeleting] = useState(false);

	async function handleDelete() {
		if (!confirm('Delete this task?')) return;
		try {
			setDeleting(true);
			await deleteTask(task._id!);
			toastSuccess('Task deleted successfully', 'deleteTaskSuccess');
			onDeleted?.(task._id!);
		} catch (err) {
			const message = getErrorMessage(err);
			toastError(message || 'Failed to delete task', 'deleteTaskError');
		} finally {
			setDeleting(false);
		}
	}

	return (
		<div className='card bg-base-100 shadow-md border'>
			<div className='card-body'>
				<h2 className='card-title'>{task.task}</h2>
				<p className='text-sm text-base-content/70'>{task.description}</p>
				<div className='flex justify-between items-center mt-2'>
					<span className='badge badge-outline'>{task.priority}</span>
					<span className='text-xs opacity-70'>
						{task.dueDate
							? new Date(task.dueDate).toLocaleString()
							: 'No due date'}
					</span>
				</div>
				<div className='card-actions justify-end mt-3'>
					<button
						className='btn btn-error btn-sm'
						onClick={handleDelete}
						disabled={deleting}>
						{deleting ? (
							<span className='loading loading-spinner loading-xs' />
						) : (
							'Delete'
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
