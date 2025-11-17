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
		<div className='max-w-4xl mx-auto p-6 space-y-8'>
			<div>
				<h1 className='text-4xl font-bold mb-2 text-primary text-center'>
					Tasks
				</h1>
				<p className='text-base-content/70 text-center'>
					Create and manage your tasks with quick due options and repeat
					scheduling.
				</p>
			</div>

			{showForm && (
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
				/>
			)}

			{!showForm && (
				<button
					className='btn btn-primary'
					onClick={() => {
						setEditingTask(null);
						setShowForm(true);
					}}>
					+ Add task
				</button>
			)}

			<div className='divider'>Your Tasks</div>

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
