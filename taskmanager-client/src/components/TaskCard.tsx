'use client';
import React from 'react';
import { Task } from '@/lib/types';

export default function TaskCard({ task }: { task: Task }) {
	return (
		<div className='card bg-base-100 border shadow-sm hover:shadow-md transition'>
			<div className='card-body'>
				<div className='flex justify-between items-center'>
					<h2 className='card-title'>{task.task}</h2>
					<div className='badge badge-accent'>
						<i className='fas fa-circle mr-1'></i>
						{task.status ?? 'Open'}
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
			</div>
		</div>
	);
}
