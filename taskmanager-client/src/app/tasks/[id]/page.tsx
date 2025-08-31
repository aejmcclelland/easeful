'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';
import RequireAuth from '@/components/RequireAuth';
import type { Task, TaskResponse } from '@/lib/types';
import { apiGet, apiDelete, HttpError } from '@/lib/api';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const json = await apiGet<TaskResponse | Task>(`/api/easeful/${id}`, {
          cache: 'no-store',
        });

        // Handle either shape: { data: Task } or Task
        const maybe = json as TaskResponse;
        setTask(maybe && 'data' in maybe ? (maybe.data as Task) : (json as Task));
      } catch (error) {
        // If the API returned a non-2xx, apiFetch already threw with text/status message
        const msg = error instanceof Error ? error.message : 'Failed to load task';
        if (msg.includes('404')) {
          // Not found -> go back to list
          router.push('/tasks');
          return;
        }
        if (msg.includes('403')) {
          toast.error('You are not authorized to view this task');
          router.push('/tasks');
          return;
        }
        console.error('Error fetching task:', error);
        toast.error('Failed to load task');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleDeleteTask = async () => {
    if (!task) return;
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);

      // apiDelete throws HttpError on non-2xx and returns parsed JSON (or void).
      await apiDelete(`/api/easeful/${task._id}`);

      toast.success('Task deleted successfully!');
      router.replace('/tasks');
      router.refresh();
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 401) {
          toast.error('Please log in to delete this task');
          router.replace('/login');
          return;
        }
        if (error.status === 403) {
          toast.error('You are not authorized to delete this task');
          return;
        }
      }
      console.error('Error deleting task:', error);
      const msg = error instanceof Error ? error.message : 'Failed to delete task';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center py-16">
          <div className="loading loading-spinner loading-lg" />
          <span className="ml-3 text-xl">Loading task...</span>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/tasks" className="btn btn-ghost btn-sm rounded-full mb-6">
          <i className="fas fa-arrow-left mr-2" />
          Back to tasks
        </Link>
        <div className="alert alert-error text-lg">
          <i className="fas fa-exclamation-triangle text-xl" />
          <span>Task not found</span>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Link href="/tasks" className="btn btn-ghost btn-sm rounded-full">
          <i className="fas fa-arrow-left mr-2" />
          Back to tasks
        </Link>

        <TaskCard task={task} onDelete={handleDeleteTask} showDeleteButton />

        {deleting && (
          <div className="flex justify-center items-center py-4">
            <div className="loading loading-spinner loading-md" />
            <span className="ml-3">Deleting task...</span>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
