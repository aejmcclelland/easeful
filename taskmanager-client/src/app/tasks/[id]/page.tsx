import TaskCard from '@/components/TaskCard';
import type { Task, TaskResponse } from '@/lib/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getTask(id: string): Promise<Task> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';
  const res = await fetch(`${API_BASE}/api/taskman/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch task ${id}: ${res.status}`);
  }

  // Your API typically returns { success, data } for single resources.
  const json: TaskResponse | Task = await res.json();
  if ('data' in (json as TaskResponse)) {
    return (json as TaskResponse).data;
  }
  return json as Task;
}

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = await getTask(params.id);

  return (
    <div className="max-w-screen-md mx-auto p-4 space-y-4">
      <Link href="/tasks" className="link link-hover text-sm">{'\u2190'} Back to tasks</Link>
      <TaskCard task={task} />
    </div>
  );
}
