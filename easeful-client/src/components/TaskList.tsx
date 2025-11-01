// easeful-client/src/components/TaskList.tsx

import { useEffect, useState } from 'react';
import type { Task } from '../types/task';
import { listTasks } from '../lib/tasks';
import TaskCard from './TaskCard';

export default function TaskList() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	async function load() {
		try {
			setLoading(true);
			setError('');
			const data = await listTasks();
			setTasks(data);
		} catch (e: any) {
			setError(e?.message || 'Failed to load tasks');
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, []);

	function handleDeleted(id: string) {
		setTasks((prev) => prev.filter((t) => t._id !== id));
	}

	if (loading) {
		return (
			<div className='flex justify-center py-8'>
				<span className='loading loading-spinner loading-lg' />
			</div>
		);
	}

	if (error) {
		return (
			<div className='alert alert-error'>
				<span>{error}</span>
				<button className='btn btn-sm ml-auto' onClick={load}>
					Retry
				</button>
			</div>
		);
	}

	if (!tasks.length) {
		return (
			<div className='text-center text-base-content/70 py-10'>
				<p>No tasks yet.</p>
				<p className='mt-1'>Create your first task using the form above.</p>
			</div>
		);
	}

	return (
		<div className='grid gap-4 md:grid-cols-2'>
			{tasks.map((t) => (
				<TaskCard key={t._id || t.task} task={t} onDeleted={handleDeleted} />
			))}
		</div>
	);
}
