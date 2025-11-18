// src/components/PriorityBadge.tsx
import type { Task } from '../types/task';
import { useState } from 'react';
import { FlagIcon } from '@heroicons/react/24/solid';
import { PillDropdown, type PillDropdownOption } from './PillDropdown';

export type Priority = Task['priority'];

type PriorityBadgeProps = {
	priority: Priority;
	editable?: boolean;
	disabled?: boolean;
	onChange?: (priority: Priority) => void;
	className?: string;
};

const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High'];

const priorityStyles:Record<Priority, string> = {
	High: 'bg-red-100 text-red-900 border border-red-200',
	Medium: 'bg-yellow-100 text-yellow-900 border border-yellow-200',
	Low: 'bg-green-100 text-green-900 border border-green-200',
};

const priorityFlagColours:Record<Priority, string> = {
	High: 'text-red-600',
	Medium: 'text-yellow-600',
	Low: 'text-green-600',
};
const priorityLabels:Record<Priority, string> = {
	High: 'High',
	Medium: 'Medium',
	Low: 'Low',
};
 function buildOptions(): PillDropdownOption<Priority>[] {
	return PRIORITY_OPTIONS.map((value) => ({
		value,
		label: priorityLabels[value],
		pillClass: priorityStyles[value],
		icon: <FlagIcon className={`w-4 h-4 ${priorityFlagColours[value]}`} />,
	}));
}

export default function PriorityBadge({
	priority,
	editable = false,
	disabled = false,
	onChange,
	className = '',
}: PriorityBadgeProps) {
	const value: Priority = priority || 'Medium';
	const options = buildOptions();
// const map: Record<Priority, { pill: string; label: string; flag: string }> = {
// 	High: {
// 		pill: 'bg-red-100 text-red-900 border border-red-200',
// 		flag: 'text-red-600',
// 		label: 'High',
// 	},
// 	Medium: {
// 		pill: 'bg-yellow-100 text-yellow-900 border border-yellow-200',
// 		flag: 'text-yellow-600',
// 		label: 'Medium',
// 	},
// 	Low: {
// 		pill: 'bg-green-100 text-green-900 border border-green-200',
// 		flag: 'text-green-600',
// 		label: 'Low',
// 	},
// } as const;

export default function PriorityBadge({
	priority,
	editable = false,
	disabled = false,
	onChange,
	className = '',
}: PriorityBadgeProps) {
	const key: Priority = priority || 'Medium';
	const { pill, label, flag } = map[key];
	const [open, setOpen] = useState(false);

	// Read-only pill when not editable or no onChange handler
	if (!editable || !onChange) {
		return (
			<span
				className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${pill} ${className}`}>
				<FlagIcon className={`w-4 h-4 ${flag}`} />
				<span>{label}</span>
			</span>
		);
	}

	// Editable dropdown pill
	return (
		<div className={`relative inline-block ${className}`}>
			<button
				type='button'
				disabled={disabled}
				onClick={() => !disabled && setOpen((prev) => !prev)}
				className={`whitespace-nowrap inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer focus:outline-none w-full ${pill}`}>
				<FlagIcon className={`w-4 h-4 ${flag}`} />
				<span>{label}</span>
			</button>

			{open && (
				<div className='absolute left-0 mt-2 z-20 bg-base-200 shadow-lg rounded-xl py-2 px-0 min-w-full'>
					<ul className='flex flex-col'>
						{PRIORITY_OPTIONS.map((option) => {
							const { pill: optionPill, label: optionLabel, flag: optionFlag } = map[option];
							return (
								<li key={option} className='my-1'>
									<button
										type='button'
										className={`flex whitespace-nowrap items-center gap-2 rounded-full px-3 py-1 text-xs font-medium w-full ${optionPill}`}
										onClick={() => {
											onChange(option);
											setOpen(false);
										}}>
										<FlagIcon className={`w-4 h-4 ${optionFlag}`} />
										<span>{optionLabel}</span>
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}
