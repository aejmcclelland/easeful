import type { Task } from '../types/task';
// Vite: use import.meta.env.DEV instead of process.env.NODE_ENV
const API_BASE = import.meta.env.DEV ? '/api/easeful' : '/api/tasks';

export async function createTask(payload: Task) {
	const res = await fetch(API_BASE, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	const json = await res.json().catch(() => ({}));
	if (!res.ok || !json?.success) {
		throw new Error(
			`Failed (${res.status}): ${
				json?.error || json?.message || 'Could not create task'
			}`
		);
	}
	return json.data as Task;
}

export async function listTasks(): Promise<Task[]> {
	const res = await fetch(API_BASE, { credentials: 'include' });
	const json = await res.json().catch(() => ({}));
	if (!res.ok || !json?.success) {
		throw new Error(json?.error || 'Failed to load tasks');
	}
	return json.data as Task[];
}

export async function updateTask(id: string, updates: Partial<Task>) {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(updates),
	});
	const json = await res.json().catch(() => ({}));
	if (!res.ok || !json?.success) {
		throw new Error(json?.error || 'Failed to update task');
	}
	return json.data as Task;
}

export async function getTaskById(id: string): Promise<Task> {
	const res = await fetch(`${API_BASE}/${id}`, {
		credentials: 'include',
	});

	const json = await res.json().catch(() => ({}));

	if (!res.ok || !json?.success || !json?.data) {
		throw new Error(json?.error || 'Failed to load task');
	}

	return json.data as Task;
}
export async function deleteTask(id: string) {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: 'DELETE',
		credentials: 'include',
	});
	const json = await res.json().catch(() => ({}));
	if (!res.ok || !json?.success) {
		throw new Error(json?.error || 'Failed to delete task');
	}
}
