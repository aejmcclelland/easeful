'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';
import type { Task, TasksResponse } from '@/lib/types';

export default function TasksPage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

	// Fetch tasks on component mount
	useEffect(() => {
		fetchTasks();
	}, []);

	const fetchTasks = async () => {
		try {
			setLoading(true);
			const res = await fetch('/api/taskman', {
				cache: 'no-store',
			});

			if (!res.ok) {
				throw new Error(`Failed to fetch tasks: ${res.status}`);
			}

			const json: TasksResponse = await res.json();
			setTasks(json.data ?? []);
		} catch (error) {
			console.error('Error fetching tasks:', error);
			toast.error('Failed to load tasks');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		// Show confirmation toast
		const confirmed = window.confirm(
			'Are you sure you want to delete this task? This action cannot be undone.'
		);

		if (!confirmed) return;

		try {
			setDeletingTaskId(taskId);

			const res = await fetch(`/api/taskman/${taskId}`, {
				method: 'DELETE',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to delete task');
			}

			// Remove task from local state
			setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

			// Show success toast
			toast.success('Task deleted successfully!');
		} catch (error) {
			console.error('Error deleting task:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to delete task';
			toast.error(errorMessage);
		} finally {
			setDeletingTaskId(null);
		}
	};

	if (loading) {
		return (
			<div className='max-w-3xl mx-auto p-4'>
				<div className='flex justify-center items-center py-12'>
					<div className='loading loading-spinner loading-lg'></div>
					<span className='ml-3 text-lg'>Loading tasks...</span>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-3xl mx-auto p-4'>
			<div className='flex justify-between items-center mb-6'>
				<div>
					<h1 className='text-2xl font-bold'>Your Tasks</h1>
					<p className='text-sm text-base-content/70 mt-1'>
						Showing your tasks, public tasks, and tasks shared with you
					</p>
				</div>
				<Link href='/tasks/new' className='btn btn-primary btn-sm'>
					<i className='fas fa-plus mr-2'></i>
					Create New Task
				</Link>
			</div>

			{tasks.length === 0 ? (
				<div className='text-center py-12'>
					<div className='max-w-md mx-auto'>
						<div className='mb-4'>
							<i className='fas fa-clipboard text-6xl text-gray-400'></i>
						</div>
						<h3 className='text-lg font-medium text-gray-900 mb-2'>
							No tasks yet
						</h3>
						<p className='text-gray-500 mb-6'>
							Get started by creating your first task. You can organize your
							work, set priorities, and track progress.
						</p>
						<Link href='/tasks/new' className='btn btn-primary'>
							<i className='fas fa-plus mr-2'></i>
							Create Your First Task
						</Link>
					</div>
				</div>
			) : (
				<ul className='grid gap-3'>
					{tasks.map((task) => (
						<li key={task._id}>
							<TaskCard
								task={task}
								onDelete={handleDeleteTask}
								showDeleteButton={true}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
