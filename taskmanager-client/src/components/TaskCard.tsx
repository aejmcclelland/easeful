'use client';
import React from 'react';
import { Task } from '@/lib/types';

interface TaskCardProps {
	task: Task;
	onDelete?: (taskId: string) => void;
	showDeleteButton?: boolean;
}

export default function TaskCard({
	task,
	onDelete,
	showDeleteButton = false,
}: TaskCardProps) {
	return (
		<div className='card bg-base-100 border shadow-sm hover:shadow-md transition'>
			<div className='card-body'>
				<div className='flex justify-between items-start'>
					<h2 className='card-title'>{task.task}</h2>
					<div className='flex flex-col items-end gap-2'>
						<div className='badge badge-accent'>
							<i className='fas fa-circle mr-1'></i>
							{task.status ?? 'Open'}
						</div>
						{/* Sharing indicators */}
						{task.isPublic && (
							<div className='badge badge-info badge-sm'>
								<i className='fas fa-globe mr-1'></i>
								Public
							</div>
						)}
						{task.sharedWith && task.sharedWith.length > 0 && (
							<div className='badge badge-warning badge-sm'>
								<i className='fas fa-share-alt mr-1'></i>
								Shared
							</div>
						)}
					</div>
				</div>
				<p className='text-base-content/70'>
					<i className='fas fa-align-left mr-2 opacity-60'></i>
					{task.description ?? 'No description'}
				</p>
				<div className='flex flex-wrap gap-2 mt-2'>
					{task.priority && (
						<div className='badge badge-outline badge-secondary'>
							<i className='fas fa-flag mr-1'></i>
							{task.priority}
						</div>
					)}
					{task.labels?.map((label) => (
						<div key={label} className='badge badge-outline'>
							<i className='fas fa-tag mr-1'></i>
							{label}
						</div>
					))}
				</div>
				{task.dueDate && (
					<p
						className='text-sm text-base-content/60 mt-2'
						suppressHydrationWarning>
						<i className='fas fa-calendar-alt mr-2'></i>
						Due:{' '}
						{new Intl.DateTimeFormat('en-GB', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							timeZone: 'UTC',
						}).format(new Date(task.dueDate))}
					</p>
				)}

				{/* Action buttons */}
				{showDeleteButton && onDelete && (
					<div className='card-actions justify-end mt-4'>
						<button
							onClick={() => onDelete(task._id)}
							className='btn btn-error btn-sm rounded-full'>
							<i className='fas fa-trash mr-2'></i>
							Delete Task
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
