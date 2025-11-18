// src/types/task.ts
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export type Task = {
	_id?: string;
	task: string;
	description?: string;
	dueDate?: string; // ISO 8601 datetime string
	quickDue?: 'none' | 'today' | 'tomorrow' | 'date';
	priority: 'Low' | 'Medium' | 'High';
	labels?: string[];
	repeat?: 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';
	status: TaskStatus;
	repeatRule?: string; // RRULE if repeat==='custom'
	repeatUntil?: string; // ISO date (YYYY-MM-DD)
	repeatCount?: number; // max occurrences
	timezone?: string; // IANA TZ, e.g. 'Europe/London'
	createdAt?: string;
	updatedAt?: string;
};



// Useful when creating a new task (server will assign _id/createdAt/etc.)
export type CreateTaskPayload = Omit<Task, '_id' | 'createdAt' | 'updatedAt'>;
