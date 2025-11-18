// src/components/PriorityBadge.tsx
import type { Task } from '../types/task';
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

const priorityStyles: Record<
	Priority,
	{ pill: string; label: string; flag: string }
> = {
	High: {
		pill: 'bg-red-100 text-red-900 border border-red-200',
		flag: 'text-red-600',
		label: 'High',
	},
	Medium: {
		pill: 'bg-yellow-100 text-yellow-900 border border-yellow-200',
		flag: 'text-yellow-600',
		label: 'Medium',
	},
	Low: {
		pill: 'bg-green-100 text-green-900 border border-green-200',
		flag: 'text-green-600',
		label: 'Low',
	},
} as const;

export default function PriorityBadge({
	priority,
	editable = false,
	disabled = false,
	onChange,
	className = '',
}: PriorityBadgeProps) {
	const value: Priority = priority || 'Medium';
	const { pill, label, flag } = priorityStyles[value];

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

	const options: PillDropdownOption<Priority>[] = PRIORITY_OPTIONS.map((p) => ({
		value: p,
		label: priorityStyles[p].label,
		pillClass: priorityStyles[p].pill,
		icon: <FlagIcon className={`w-4 h-4 ${priorityStyles[p].flag}`} />,
	}));

	return (
		<PillDropdown<Priority>
			value={value}
			options={options}
			disabled={disabled}
			onChange={(val) => onChange(val)}
			className={className}
		/>
	);
}
