// Shared app types for the Taskman client

// A single Task document (shape based on your Express/Mongoose model)
export type Task = {
	_id: string;
	task: string;
	description?: string;
	status?: 'Pending' | 'In Progress' | 'Completed' | string;
	priority?: 'Low' | 'Medium' | 'High' | string;
	dueDate?: string; // ISO string from API
	labels?: string[];
	images?: { 
		public_id: string; 
		url: string; 
		width?: number; 
		height?: number; 
		bytes?: number; 
	}[];
	slug?: string;
	createdAt?: string;
	updatedAt?: string;
	user?: string; // ObjectId as string
	isPublic?: boolean; // Whether the task is publicly visible
	sharedWith?: string[]; // Array of user IDs the task is shared with
	location?: {
		type: 'Point';
		coordinates: [number, number]; // [lng, lat]
		formattedAddress?: string;
		street?: string;
		city?: string;
		state?: string;
		zipcode?: string;
		country?: string;
	};
};

// Pagination details from advancedResults middleware
export type PaginationInfo = {
	next?: {
		page: number;
		limit: number;
	};
	prev?: {
		page: number;
		limit: number;
	};
	currentPage: number;
	totalPages: number;
};

// Standard API wrapper your endpoints return for list/detail
export type TasksResponse = {
	success: boolean;
	count: number;
	total: number;
	pagination: PaginationInfo;
	data: Task[];
};

// Optional: single-item response (some endpoints return { success, data })
export type TaskResponse = {
	success: boolean;
	data: Task;
};

// User model (matches your server User schema shape)
export type User = {
	_id: string;
	name: string;
	email: string;
	role: 'user' | 'publisher' | 'admin';
	avatar?: {
		public_id: string;
		url: string;
	};
	createdAt?: string;
};
