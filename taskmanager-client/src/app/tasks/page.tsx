import { cookies } from 'next/headers';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';
import type { Task, TasksResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
	try {
		// Use explicit API base; no relative URL issues in Server Components
		const API_BASE =
			process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';
		const token = (await cookies()).get('token')?.value;

		const res = await fetch(`${API_BASE}/api/taskman`, {
			cache: 'no-store',
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});

		if (!res.ok) {
			throw new Error(`Failed to fetch tasks: ${res.status}`);
		}

		const json: TasksResponse = await res.json();
		const data: Task[] = json.data ?? [];

		return (
			<div className='max-w-3xl mx-auto p-4'>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-2xl font-bold'>Your Tasks</h1>
					<Link href='/tasks/new' className='btn btn-primary btn-sm'>
						Create New Task
					</Link>
				</div>

				{data.length === 0 ? (
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
						{data.map((t) => (
							<li key={t._id}>
								<Link href={`/tasks/${t._id}`} className='block'>
									<TaskCard task={t} />
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>
		);
	} catch (error) {
		return (
			<div className='max-w-3xl mx-auto p-4'>
				<h1 className='text-2xl font-bold mb-4'>Tasks</h1>
				<div className='alert alert-error'>
					<i className='fas fa-exclamation-triangle text-lg'></i>
					<span>Error</span>
				</div>
				<div className='card bg-base-100 border'>
					<div className='card-body'>
						<h2 className='card-title text-error'>Failed to Load Tasks</h2>
						<p>
							{error instanceof Error
								? error.message
								: 'An unexpected error occurred while loading your tasks.'}
						</p>
						<div className='card-actions justify-end'>
							<button
								onClick={() => window.location.reload()}
								className='btn btn-primary'>
								Try Again
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
