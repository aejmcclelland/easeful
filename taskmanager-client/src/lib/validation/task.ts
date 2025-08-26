import { z } from 'zod';

// Task Priority enum schema
export const TaskPrioritySchema = z.enum(['Low', 'Medium', 'High']);

// Task Status enum schema  
export const TaskStatusSchema = z.enum(['Pending', 'In Progress', 'Completed']);

// Label validation - individual label rules
const LabelSchema = z
	.string()
	.trim()
	.min(1, 'Label cannot be empty')
	.max(50, 'Label cannot be longer than 50 characters')
	.regex(/^[a-zA-Z0-9\s\-_]+$/, 'Label can only contain letters, numbers, spaces, hyphens, and underscores');

// Labels array schema
export const LabelsSchema = z
	.array(LabelSchema)
	.max(10, 'Cannot have more than 10 labels per task')
	.optional();

// Labels string input schema (for forms - comma separated)
export const LabelsStringSchema = z
	.string()
	.optional()
	.transform((val) => {
		if (!val || val.trim() === '') return [];
		return val
			.split(',')
			.map(label => label.trim())
			.filter(label => label.length > 0);
	})
	.pipe(z.array(LabelSchema).max(10, 'Cannot have more than 10 labels per task'));

// Create Task schema (for form submission)
export const CreateTaskSchema = z.object({
	task: z
		.string()
		.trim()
		.min(1, 'Task name is required')
		.max(150, 'Task name cannot be longer than 150 characters'),
	
	description: z
		.string()
		.trim()
		.min(1, 'Description is required')
		.max(2000, 'Description cannot be longer than 2000 characters'),
	
	priority: TaskPrioritySchema.default('Medium'),
	
	status: TaskStatusSchema.default('Pending'),
	
	dueDate: z
		.string()
		.optional()
		.refine((date) => {
			if (!date || date === '') return true; // Optional field
			const parsed = new Date(date);
			return !isNaN(parsed.getTime());
		}, 'Invalid date format')
		.transform((date) => {
			if (!date || date === '') return undefined;
			return new Date(date).toISOString();
		}),
	
	labels: LabelsStringSchema,
});

// Update Task schema (same as create, but all fields optional except task and description)
export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
	task: z
		.string()
		.trim()
		.min(1, 'Task name is required')
		.max(150, 'Task name cannot be longer than 150 characters'),
	
	description: z
		.string()
		.trim()
		.min(1, 'Description is required')
		.max(2000, 'Description cannot be longer than 2000 characters'),
});

// Task query parameters schema (for filtering/searching)
export const TaskQuerySchema = z.object({
	q: z.string().optional(), // Search query
	status: z.string().optional().transform((val) => {
		if (!val) return undefined;
		return val.split(',').map(s => s.trim());
	}),
	priority: z.string().optional().transform((val) => {
		if (!val) return undefined;
		return val.split(',').map(p => p.trim());
	}),
	labels: z.string().optional().transform((val) => {
		if (!val) return undefined;
		return val.split(',').map(l => l.trim());
	}),
	sort: z.enum(['-createdAt', 'createdAt', 'dueDate', '-priority', '-status']).optional(),
	page: z.string().optional().transform((val) => {
		const num = parseInt(val || '1', 10);
		return isNaN(num) || num < 1 ? 1 : num;
	}),
	limit: z.string().optional().transform((val) => {
		const num = parseInt(val || '10', 10);
		return isNaN(num) || num < 1 ? 10 : Math.min(num, 100); // Cap at 100
	}),
});

// Type exports
export type CreateTaskData = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskData = z.infer<typeof UpdateTaskSchema>;
export type TaskQueryParams = z.infer<typeof TaskQuerySchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;