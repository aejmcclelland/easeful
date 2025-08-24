'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';
import type { Task, TaskResponse } from '@/lib/types';

export default function TaskDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [task, setTask] = useState<Task | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const fetchTask = async () => {
			try {
				const { id } = await params;
				const res = await fetch(`/api/taskman/${id}`, {
					cache: 'no-store',
				});

				if (res.status === 404) {
					router.push('/tasks');
					return;
				}

				if (res.status === 403) {
					toast.error('You are not authorized to view this task');
					router.push('/tasks');
					return;
				}

				if (!res.ok) {
					throw new Error(`Failed to fetch task: ${res.status}`);
				}

				const json: TaskResponse | Task = await res.json();
				if ((json as TaskResponse).data) {
					setTask((json as TaskResponse).data as Task);
				} else {
					setTask(json as Task);
				}
			} catch (error) {
				console.error('Error fetching task:', error);
				toast.error('Failed to load task');
			} finally {
				setLoading(false);
			}
		};

		fetchTask();
	}, [params, router]);

	const handleDeleteTask = async () => {
		if (!task) return;

		// Show confirmation toast
		const confirmed = window.confirm(
			'Are you sure you want to delete this task? This action cannot be undone.'
		);

		if (!confirmed) return;

		try {
			setDeleting(true);

			const res = await fetch(`/api/taskman/${task._id}`, {
				method: 'DELETE',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to delete task');
			}

			// Show success toast and redirect
			toast.success('Task deleted successfully!');
			router.push('/tasks');
		} catch (error) {
			console.error('Error deleting task:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to delete task';
			toast.error(errorMessage);
		} finally {
			setDeleting(false);
		}
	};

	if (loading) {
		return (
			<div className='max-w-screen-md mx-auto p-4 space-y-4'>
				<div className='flex justify-center items-center py-12'>
					<div className='loading loading-spinner loading-lg'></div>
					<span className='ml-3 text-lg'>Loading task...</span>
				</div>
			</div>
		);
	}

	if (!task) {
		return (
			<div className='max-w-screen-md mx-auto p-4 space-y-4'>
				<Link href='/tasks' className='link link-hover text-sm'>
					{'\u2190'} Back to tasks
				</Link>
				<div className='alert alert-error'>
					<i className='fas fa-exclamation-triangle text-lg'></i>
					<span>Task not found</span>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-screen-md mx-auto p-4 space-y-4'>
			<Link href='/tasks' className='link link-hover text-sm'>
				{'\u2190'} Back to tasks
			</Link>

			<TaskCard
				task={task}
				onDelete={handleDeleteTask}
				showDeleteButton={true}
			/>

			{deleting && (
				<div className='flex justify-center items-center py-4'>
					<div className='loading loading-spinner loading-md'></div>
					<span className='ml-3'>Deleting task...</span>
				</div>
			)}
		</div>
	);
}
