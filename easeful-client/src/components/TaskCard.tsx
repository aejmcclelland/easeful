// src/components/TaskCard.tsx
import type { Task } from '../types/task';
import { deleteTask, updateTask } from '../lib/tasks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../lib/getErrorMessage';
import { toastSuccess, toastError } from '../lib/toast';
import PriorityBadge from './PriorityBadge';

type TaskCardProps = {
	task: Task;
	onDeleted?: (id: string) => void;
	onUpdated?: (task: Task) => void;
};

export default function TaskCard({ task, onDeleted, onUpdated }: TaskCardProps) {
	const [deleting, setDeleting] = useState(false);
	const [updatingPriority, setUpdatingPriority] = useState(false);
	const navigate = useNavigate();

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

	async function changePriority(newPriority: Task['priority']) {
		if (newPriority === task.priority) return;
		setUpdatingPriority(true);
		try {
			const updated = await updateTask(task._id!, { priority: newPriority });
			toastSuccess('Priority updated', 'updateTaskSuccess');
			onUpdated?.(updated);
		} catch (err) {
			const message = getErrorMessage(err);
			toastError(message || 'Failed to update priority', 'updateTaskError');
		} finally {
			setUpdatingPriority(false);
		}
	}

	return (
		<div className='card bg-base-100 shadow-md border'>
			<div className='card-body'>
				<h2 className='card-title'>{task.task}</h2>
				<p className='text-sm text-base-content/70'>{task.description}</p>
				<div className='flex justify-between items-center mt-2 gap-2'>
					{/* Editable priority badge */}
					<PriorityBadge
						priority={task.priority}
						editable
						disabled={updatingPriority}
						onChange={(newPriority) => changePriority(newPriority)}
					/>
					<span className='text-xs opacity-70'>
						{task.dueDate
							? new Date(task.dueDate).toLocaleString()
							: 'No due date'}
					</span>
				</div>
				<div className='card-actions justify-end mt-3 gap-2'>
					<button
						className='btn btn-outline btn-sm'
						onClick={() => navigate(`/tasks/${task._id}/edit`)}
					>
						Edit
					</button>
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
