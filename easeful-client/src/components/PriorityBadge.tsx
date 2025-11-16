// src/components/PriorityBadge.tsx
import type { Task } from '../types/task';
import { FlagIcon } from '@heroicons/react/24/solid';

type Props = {
	priority: Task['priority'];
};

const map = {
	High: { colour: 'text-red-500', label: 'High' },
	Medium: { colour: 'text-yellow-500', label: 'Medium' },
	Low: { colour: 'text-green-500', label: 'Low' },
} as const;

export default function PriorityBadge({ priority }: Props) {
	const key = priority || 'Medium';
	const { colour, label } = map[key];

	return (
		<span className='badge gap-1'>
			{label}
			<FlagIcon className={`w-4 h-4 ${colour}`} />
		</span>
	);
}
