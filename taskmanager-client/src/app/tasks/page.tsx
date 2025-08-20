import Link from 'next/link';
export const dynamic = 'force-dynamic';

import { Task } from '@/lib/types';
import TaskCard from '@/components/TaskCard';

type TasksResponse = {
  success: boolean;
  count: number;
  pagination: unknown;
  data: Task[];
};

export default async function TasksPage() {
  // Server Components require an absolute URL. Use env override if provided.
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';
  const res = await fetch(`${API_BASE}/api/taskman`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.status}`);
  }

  const json: TasksResponse = await res.json();
  const data: Task[] = json.data ?? [];
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>
      <ul className="grid gap-3">
        {data.map((t: Task) => (
          <Link key={t._id} href={`/tasks/${t._id}`}>
            <TaskCard task={t} />
          </Link>
        ))}
      </ul>
    </div>
  );
}
