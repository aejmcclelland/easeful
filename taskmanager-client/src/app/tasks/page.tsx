'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';
import SearchBar from '@/components/SearchBar';
import LabelFilter from '@/components/LabelFilter';
import TaskFilters from '@/components/TaskFilters';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import type { Task, TasksResponse, PaginationInfo } from '@/lib/types';

type SortOption =
	| '-createdAt'
	| 'createdAt'
	| 'dueDate'
	| '-priority'
	| '-status';

function TasksPageContent() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState<PaginationInfo | null>(null);
	const [total, setTotal] = useState(0);
	const [userLabels, setUserLabels] = useState<string[]>([]);

	const router = useRouter();
	const searchParams = useSearchParams();

	const fetchTasks = useCallback(async () => {
		try {
			setLoading(true);
			// Build query string from URL parameters
			const queryString = searchParams.toString();
			const url = queryString ? `/api/taskman?${queryString}` : '/api/taskman';

			const res = await fetch(url, {
				cache: 'no-store',
				credentials: 'include',
			});

			if (!res.ok) {
				throw new Error(`Failed to fetch tasks: ${res.status}`);
			}

			const json: TasksResponse = await res.json();
			const tasksData = json.data ?? [];
			setTasks(tasksData);
			setPagination(json.pagination);
			setTotal(json.total || 0);
			
			// Note: Labels will be updated by the updateLabelsFromTasks useEffect
		} catch (error) {
			console.error('Error fetching tasks:', error);
			toast.error('Failed to load tasks');
		} finally {
			setLoading(false);
		}
	}, [searchParams]);


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
	const getFilterArray = useCallback((key: string): string[] => {
		const value = searchParams.get(key);
		return value ? value.split(',').map((v) => v.trim()) : [];
	}, [searchParams]);

	// Helper function to update available labels from current tasks
	const updateLabelsFromTasks = useCallback((tasks: Task[]) => {
		const labels = new Set<string>();
		tasks.forEach((task) => {
			task.labels?.forEach((label) => labels.add(label));
		});
		const labelsArray = Array.from(labels).sort();
		setUserLabels(labelsArray);

		// Check if any active label filters are no longer valid
		const activeLabels = getFilterArray('labels');
		const invalidLabels = activeLabels.filter(label => !labels.has(label));
		
		if (invalidLabels.length > 0) {
			// Remove invalid labels from active filters
			const validActiveLabels = activeLabels.filter(label => labels.has(label));
			updateURL({ labels: validActiveLabels });
		}
	}, [getFilterArray, updateURL]);

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
			const res = await fetch(`/api/taskman/${taskId}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to delete task');
			}

			// Remove task from local state and update labels
			setTasks((prevTasks) => {
				const updatedTasks = prevTasks.filter((task) => task._id !== taskId);
				updateLabelsFromTasks(updatedTasks);
				return updatedTasks;
			});

			// Show success toast
			toast.success('Task deleted successfully!');
		} catch (error) {
			console.error('Error deleting task:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to delete task';
			toast.error(errorMessage);
		}
	};

	// Fetch tasks when URL parameters change
	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	// Update labels whenever tasks change
	useEffect(() => {
		updateLabelsFromTasks(tasks);
	}, [tasks, updateLabelsFromTasks]);

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
			<SearchBar value={searchQuery} onChange={handleSearchChange} />

			{/* Labels Filter Chips */}
			<LabelFilter
				labels={userLabels}
				activeLabels={activeLabels}
				onToggle={handleLabelToggle}
			/>

			{/* Sort and Status Filters */}
			<TaskFilters
				currentSort={currentSort}
				activeStatuses={activeStatuses}
				hasActiveFilters={hasActiveFilters()}
				onSortChange={handleSortChange}
				onStatusFilter={handleStatusFilter}
				onClearFilters={clearAllFilters}
			/>

			{/* Loading State */}
			{loading ? (
				<div className='flex justify-center items-center py-12'>
					<div className='loading loading-spinner loading-lg'></div>
					<span className='ml-3 text-lg'>Loading tasks...</span>
				</div>
			) : tasks.length === 0 ? (
				/* Empty State */
				<EmptyState
					hasActiveFilters={hasActiveFilters()}
					onClearFilters={clearAllFilters}
				/>
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
					{pagination && (
						<Pagination
							pagination={pagination}
							currentPage={currentPage}
							currentLimit={currentLimit}
							total={total}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
						/>
					)}
				</>
			)}
		</div>
	);
}

export default function TasksPage() {
	return (
		<Suspense fallback={
			<div className='max-w-3xl mx-auto p-4'>
				<div className='flex justify-center items-center py-12'>
					<div className='loading loading-spinner loading-lg'></div>
					<span className='ml-3 text-lg'>Loading tasks...</span>
				</div>
			</div>
		}>
			<TasksPageContent />
		</Suspense>
	);
}
