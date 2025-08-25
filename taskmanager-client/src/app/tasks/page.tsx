'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';
import type { Task, TasksResponse, PaginationInfo } from '@/lib/types';

type SortOption =
	| '-createdAt'
	| 'createdAt'
	| 'dueDate'
	| '-priority'
	| '-status';

export default function TasksPage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
	const [pagination, setPagination] = useState<PaginationInfo | null>(null);
	const [total, setTotal] = useState(0);
	const [userLabels, setUserLabels] = useState<string[]>([]);

	const router = useRouter();
	const searchParams = useSearchParams();

	// Fetch tasks when URL parameters change
	useEffect(() => {
		fetchTasks();
		fetchUserLabels();
	}, [searchParams]);

	const fetchTasks = async () => {
		try {
			setLoading(true);
			// Build query string from URL parameters
			const queryString = searchParams.toString();
			const url = queryString ? `/api/taskman?${queryString}` : '/api/taskman';

			const res = await fetch(url, {
				cache: 'no-store',
			});

			if (!res.ok) {
				throw new Error(`Failed to fetch tasks: ${res.status}`);
			}

			const json: TasksResponse = await res.json();
			setTasks(json.data ?? []);
			setPagination(json.pagination);
			setTotal(json.total || 0);
		} catch (error) {
			console.error('Error fetching tasks:', error);
			toast.error('Failed to load tasks');
		} finally {
			setLoading(false);
		}
	};

	// Fetch user's unique labels for the filter chips
	const fetchUserLabels = async () => {
		try {
			// Get all user tasks without pagination to extract unique labels
			const res = await fetch('/api/taskman?limit=1000&select=labels', {
				cache: 'no-store',
			});

			if (res.ok) {
				const json: TasksResponse = await res.json();
				const allLabels = new Set<string>();
				json.data.forEach((task) => {
					task.labels?.forEach((label) => allLabels.add(label));
				});
				setUserLabels(Array.from(allLabels).sort());
			}
		} catch (error) {
			console.error('Error fetching labels:', error);
		}
	};

	// URL parameter helpers
	const updateURL = useCallback(
		(updates: Record<string, string | string[] | null>) => {
			const params = new URLSearchParams(searchParams.toString());

			Object.entries(updates).forEach(([key, value]) => {
				if (
					value === null ||
					value === '' ||
					(Array.isArray(value) && value.length === 0)
				) {
					params.delete(key);
				} else if (Array.isArray(value)) {
					params.set(key, value.join(','));
				} else {
					params.set(key, value);
				}
			});

			// Reset to page 1 when filters change
			if (
				Object.keys(updates).some((key) => key !== 'page' && key !== 'limit')
			) {
				params.set('page', '1');
			}

			router.push(`/tasks?${params.toString()}`);
		},
		[searchParams, router]
	);

	// Get current filter values from URL
	const getFilterValue = (key: string): string => searchParams.get(key) || '';
	const getFilterArray = (key: string): string[] => {
		const value = searchParams.get(key);
		return value ? value.split(',').map((v) => v.trim()) : [];
	};

	// Filter handlers
	const handleSortChange = (sort: SortOption) => {
		updateURL({ sort });
	};

	const handlePageChange = (page: number) => {
		updateURL({ page: page.toString() });
	};

	const handlePageSizeChange = (limit: number) => {
		updateURL({ limit: limit.toString(), page: '1' });
	};

	const handleLabelToggle = (label: string) => {
		const currentLabels = getFilterArray('labels');
		const newLabels = currentLabels.includes(label)
			? currentLabels.filter((l) => l !== label)
			: [...currentLabels, label];
		updateURL({ labels: newLabels });
	};

	const handleStatusFilter = (status: string[]) => {
		updateURL({ status });
	};

	const handleSearchChange = (q: string) => {
		updateURL({ q });
	};

	const clearAllFilters = () => {
		router.push('/tasks');
	};

	// Check if any filters are active
	const hasActiveFilters = () => {
		return Array.from(searchParams.keys()).some(
			(key) => !['page', 'limit', 'sort'].includes(key)
		);
	};

	const handleDeleteTask = async (taskId: string) => {
		// Show confirmation toast
		const confirmed = window.confirm(
			'Are you sure you want to delete this task? This action cannot be undone.'
		);

		if (!confirmed) return;

		try {
			setDeletingTaskId(taskId);

			const res = await fetch(`/api/taskman/${taskId}`, {
				method: 'DELETE',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to delete task');
			}

			// Remove task from local state
			setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

			// Show success toast
			toast.success('Task deleted successfully!');
		} catch (error) {
			console.error('Error deleting task:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to delete task';
			toast.error(errorMessage);
		} finally {
			setDeletingTaskId(null);
		}
	};

	if (loading) {
		return (
			<div className='max-w-3xl mx-auto p-4'>
				<div className='flex justify-center items-center py-12'>
					<div className='loading loading-spinner loading-lg'></div>
					<span className='ml-3 text-lg'>Loading tasks...</span>
				</div>
			</div>
		);
	}

	const currentSort = (getFilterValue('sort') as SortOption) || '-createdAt';
	const currentPage = parseInt(getFilterValue('page')) || 1;
	const currentLimit = parseInt(getFilterValue('limit')) || 10;
	const activeLabels = getFilterArray('labels');
	const activeStatuses = getFilterArray('status');
	const searchQuery = getFilterValue('q');

	return (
		<div className='max-w-4xl mx-auto p-4'>
			{/* Header */}
			<div className='flex justify-between items-center mb-6'>
				<div>
					<h1 className='text-2xl font-bold'>Your Tasks</h1>
					<p className='text-sm text-base-content/70 mt-1'>
						{total > 0 && `Showing ${total} task${total === 1 ? '' : 's'}`}
						{hasActiveFilters() && ' (filtered)'}
					</p>
				</div>
				<Link href='/tasks/new' className='btn btn-primary btn-sm rounded-full'>
					<i className='fas fa-plus mr-2'></i>
					Create New Task
				</Link>
			</div>

			{/* Search Bar */}
			<div className='mb-4'>
				<div className='form-control'>
					<input
						type='text'
						placeholder='Search tasks...'
						className='input input-bordered w-full'
						value={searchQuery}
						onChange={(e) => handleSearchChange(e.target.value)}
					/>
				</div>
			</div>

			{/* Labels Filter Chips */}
			{userLabels.length > 0 && (
				<div className='mb-4'>
					<h3 className='text-sm font-medium mb-2'>Filter by labels:</h3>
					<div className='flex flex-wrap gap-2'>
						{userLabels.map((label) => (
							<button
								key={label}
								onClick={() => handleLabelToggle(label)}
								className={`badge badge-lg cursor-pointer transition-colors ${
									activeLabels.includes(label)
										? 'badge-primary'
										: 'badge-outline hover:badge-primary'
								}`}>
								{label}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Sort and Status Filters */}
			<div className='mb-4 flex flex-wrap justify-between items-end gap-4'>
				<div className='flex flex-wrap gap-4 items-end'>
					{/* Sort Dropdown */}
					<div className='form-control'>
						<label className='label'>
							<span className='label-text text-sm'>Sort by</span>
						</label>
						<select
							className='select select-bordered select-sm rounded-full'
							value={currentSort}
							onChange={(e) => handleSortChange(e.target.value as SortOption)}>
							<option value='-createdAt'>Newest first</option>
							<option value='createdAt'>Oldest first</option>
							<option value='dueDate'>Due date (soonest first)</option>
							<option value='-priority'>Priority (High first)</option>
							<option value='-status'>Status</option>
						</select>
					</div>

					{/* Clear Filters */}
					{hasActiveFilters() && (
						<div className='form-control'>
							<label className='label'>
								<span className='label-text text-sm'>&nbsp;</span>
							</label>
							<button
								onClick={clearAllFilters}
								className='btn btn-outline btn-sm rounded-full'>
								Clear filters
							</button>
						</div>
					)}
				</div>

				{/* Status Filter - Right aligned */}
				<div className='form-control'>
					<details className='dropdown dropdown-end'>
						<summary className='btn btn-outline btn-sm rounded-full'>
							Status {activeStatuses.length > 0 && `(${activeStatuses.length})`}
						</summary>
						<div className='dropdown-content z-20 menu p-4 shadow-lg bg-base-100 rounded-box w-56 border border-base-300 mt-2'>
							<div className='mb-2'>
								<h4 className='font-medium text-sm text-base-content/70'>
									Select statuses
								</h4>
							</div>
							{['Pending', 'In Progress', 'Completed'].map((status) => (
								<label
									key={status}
									className='label cursor-pointer py-2 hover:bg-base-200 rounded px-2'>
									<span className='label-text'>{status}</span>
									<input
										type='checkbox'
										className='checkbox checkbox-sm'
										checked={activeStatuses.includes(status)}
										onChange={(e) => {
											const newStatuses = e.target.checked
												? [...activeStatuses, status]
												: activeStatuses.filter((s) => s !== status);
											handleStatusFilter(newStatuses);
										}}
									/>
								</label>
							))}
						</div>
					</details>
				</div>
			</div>

			{/* Loading State */}
			{loading ? (
				<div className='flex justify-center items-center py-12'>
					<div className='loading loading-spinner loading-lg'></div>
					<span className='ml-3 text-lg'>Loading tasks...</span>
				</div>
			) : tasks.length === 0 ? (
				/* Empty State */
				<div className='text-center py-12'>
					<div className='max-w-md mx-auto'>
						<div className='mb-4'>
							<i className='fas fa-clipboard text-6xl text-gray-400'></i>
						</div>
						{hasActiveFilters() ? (
							<>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>
									No tasks match your filters
								</h3>
								<p className='text-gray-500 mb-6'>
									Try adjusting your search criteria or clear the filters.
								</p>
								<button
									onClick={clearAllFilters}
									className='btn btn-primary rounded-full'>
									<i className='fas fa-times mr-2'></i>
									Clear filters
								</button>
							</>
						) : (
							<>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>
									No tasks yet
								</h3>
								<p className='text-gray-500 mb-6'>
									Get started by creating your first task. You can organize your
									work, set priorities, and track progress.
								</p>
								<Link
									href='/tasks/new'
									className='btn btn-primary rounded-full'>
									<i className='fas fa-plus mr-2'></i>
									Create Your First Task
								</Link>
							</>
						)}
					</div>
				</div>
			) : (
				/* Task List and Pagination */
				<>
					<ul className='grid gap-3 mb-6'>
						{tasks.map((task) => (
							<li key={task._id}>
								<TaskCard
									task={task}
									onDelete={handleDeleteTask}
									showDeleteButton={true}
								/>
							</li>
						))}
					</ul>

					{/* Pagination Controls */}
					{pagination && pagination.totalPages > 1 && (
						<div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
							<div className='text-sm text-base-content/70'>
								Page {currentPage} of {pagination.totalPages}
								{total > 0 && ` (${total} total)`}
							</div>

							<div className='flex items-center gap-2'>
								{/* Page Size Selector */}
								<div className='form-control'>
									<select
										className='select select-bordered select-sm rounded-full'
										value={currentLimit}
										onChange={(e) =>
											handlePageSizeChange(parseInt(e.target.value))
										}>
										<option value={10}>10 per page</option>
										<option value={20}>20 per page</option>
										<option value={50}>50 per page</option>
									</select>
								</div>

								{/* Pagination Buttons */}
								<div className='join'>
									<button
										className='join-item btn btn-sm rounded-l-full'
										disabled={!pagination.prev}
										onClick={() =>
											pagination.prev && handlePageChange(pagination.prev.page)
										}>
										<i className='fas fa-chevron-left'></i>
									</button>
									<button className='join-item btn btn-sm'>
										{currentPage}
									</button>
									<button
										className='join-item btn btn-sm rounded-r-full'
										disabled={!pagination.next}
										onClick={() =>
											pagination.next && handlePageChange(pagination.next.page)
										}>
										<i className='fas fa-chevron-right'></i>
									</button>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
