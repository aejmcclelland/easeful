

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
  images?: { url: string; filename?: string }[];
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: string; // ObjectId as string
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

// Standard API wrapper your endpoints return for list/detail
export type TasksResponse = {
  success: boolean;
  count: number;
  pagination: unknown;
  data: Task[];
};

// Optional: single-item response (some endpoints return { success, data })
export type TaskResponse = {
  success: boolean;
  data: Task;
};