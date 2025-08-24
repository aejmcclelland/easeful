import TaskCard from '@/components/TaskCard';
import type { Task, TaskResponse } from '@/lib/types';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getTask(id: string): Promise<Task> {
	// Next 15+ dynamic APIs must be awaited
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

	// Use a safe absolute API base (fallback to localhost:3000)
	const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';
	const url = `${API_BASE}/api/taskman/${id}`;

	const headers: HeadersInit = token
		? { Authorization: `Bearer ${token}` }
		: {};

	const res = await fetch(url, { cache: 'no-store', headers });

	if (res.status === 404) {
		notFound();
	}

	if (res.status === 403) {
		// Task exists but user is not authorized to view it
		throw new Error('You are not authorized to view this task');
	}

	if (!res.ok) {
		throw new Error(`Failed to fetch task: ${res.status}`);
	}

	const json: TaskResponse | Task = await res.json();
	if ((json as TaskResponse).data) {
		return (json as TaskResponse).data as Task;
	}
	return json as Task;
}

export default async function TaskDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	try {
		const { id } = await params;
		const task = await getTask(id);

		return (
			<div className='max-w-screen-md mx-auto p-4 space-y-4'>
				<Link href='/tasks' className='link link-hover text-sm'>
					{'\u2190'} Back to tasks
				</Link>
				<TaskCard task={task} />
			</div>
		);
	} catch (error) {
		// Handle unauthorized access
		if (error instanceof Error && error.message.includes('not authorized')) {
			return (
				<div className='max-w-screen-md mx-auto p-4 space-y-4'>
					<Link href='/tasks' className='link link-hover text-sm'>
						{'\u2190'} Back to tasks
					</Link>
					<div className='alert alert-error'>
						<i className='fas fa-ban text-lg'></i>
						<span>Access Denied</span>
					</div>
					<div className='card bg-base-100 border'>
						<div className='card-body'>
							<h2 className='card-title text-error'>Unauthorized Access</h2>
							<p>
								You are not authorized to view this task. This task belongs to
								another user.
							</p>
							<div className='card-actions justify-end'>
								<Link href='/tasks' className='btn btn-primary'>
									View Your Tasks
								</Link>
							</div>
						</div>
					</div>
				</div>
			);
		}

		// Handle other errors
		return (
			<div className='max-w-screen-md mx-auto p-4 space-y-4'>
				<Link href='/tasks' className='link link-hover text-sm'>
					{'\u2190'} Back to tasks
				</Link>
				<div className='alert alert-error'>
					<i className='fas fa-exclamation-triangle text-lg'></i>
					<span>Error</span>
				</div>
				<div className='card bg-base-100 border'>
					<div className='card-body'>
						<h2 className='card-title text-error'>Failed to Load Task</h2>
						<p>
							{error instanceof Error
								? error.message
								: 'An unexpected error occurred while loading the task.'}
						</p>
						<div className='card-actions justify-end'>
							<Link href='/tasks' className='btn btn-primary'>
								View Your Tasks
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
