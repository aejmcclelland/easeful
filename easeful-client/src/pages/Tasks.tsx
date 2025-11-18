// src/pages/Tasks.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import type { Task } from '../types/task';
import { listTasks } from '../lib/tasks';
import { useAuth } from '../hooks/useAuth';

export default function Tasks() {
	const { user, loading: authLoading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [tasks, setTasks] = useState<Task[]>([]);
	const [tasksLoading, setTasksLoading] = useState(true);
	const [tasksError, setTasksError] = useState<string | null>(null);

	const [showForm, setShowForm] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);

	// Load tasks from API
	useEffect(() => {
		(async () => {
			try {
				const data = await listTasks();
				setTasks(data);
			} catch (err: unknown) {
				setTasksError(
					err instanceof Error ? err.message : 'Failed to load tasks'
				);
			} finally {
				setTasksLoading(false);
			}
		})();
	}, []);

	// Redirect to login when not authenticated
	useEffect(() => {
		if (!authLoading && !user) {
			const from = location.pathname + location.search;
			navigate(`/login?from=${encodeURIComponent(from)}`, { replace: true });
		}
	}, [authLoading, user, navigate, location]);

	// While auth state or tasks are loading
	if (authLoading || tasksLoading) {
		return <p>Loading tasks…</p>; // or a spinner
	}

	// If user is not logged in after auth has resolved, don't render page
	if (!user) return null;

	// If we have a tasks error, show it
	if (tasksError) {
		return <p className='text-error'>{tasksError}</p>;
	}

	function handleTaskCreated(newTask: Task) {
		// show newest at the top
		setTasks((prev) => [newTask, ...prev]);
	}

	function handleTaskUpdated(updated: Task) {
		setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
	}

	return (
		<div className='max-w-4xl mx-auto p-6 space-y-6'>
			{/* Header with title and Add task button */}
			<div className='flex items-center justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold mb-1 text-primary'>Tasks</h1>
					<p className='text-sm text-base-content/70'>
						Create and manage your tasks with due options and repeat scheduling.
					</p>
				</div>

				<button
					className='btn btn-primary btn-sm gap-2'
					onClick={() => {
						setEditingTask(null);
						setShowForm((prev) => !prev);
					}}>
					<span className='text-lg leading-none'>＋</span>
					<span>{showForm ? 'Close form' : 'Add task'}</span>
				</button>
			</div>

			{/* Collapsible TaskForm card */}
			<div
				className={`transition-all duration-200 ${
					showForm
						? 'opacity-100 max-h-[1000px] translate-y-0'
						: 'opacity-0 max-h-0 -translate-y-2 pointer-events-none'
				}`}>
				{showForm && (
					<div className='card bg-base-100 shadow-md border border-base-300'>
						<div className='card-body'>
							<TaskForm
								editingTask={editingTask}
								onTaskCreated={(newTask) => {
									handleTaskCreated(newTask);
									setShowForm(false);
								}}
								onTaskUpdated={(updatedTask) => {
									handleTaskUpdated(updatedTask);
									setEditingTask(null);
									setShowForm(false);
								}}
								onCancelEdit={() => {
									setEditingTask(null);
									setShowForm(false);
								}}
								onCancel={() => {
									setShowForm(false);
								}}
							/>
						</div>
					</div>
				)}
			</div>

			<div className='divider my-4'>Your Tasks</div>

			<TaskList
				tasks={tasks}
				onTaskDeleted={(id) =>
					setTasks((prev) => prev.filter((t) => t._id !== id))
				}
				onTaskUpdated={handleTaskUpdated}
				onTaskEdit={(task) => {
					setEditingTask(task);
					setShowForm(true);
				}}
			/>
		</div>
	);
}
