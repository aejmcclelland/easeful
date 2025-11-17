// src/components/PriorityBadge.tsx
import type { Task } from '../types/task';
import { FlagIcon } from '@heroicons/react/24/solid';

type Priority = Task['priority'];

type PriorityBadgeProps = {
  priority: Priority;
  editable?: boolean;
  disabled?: boolean;
  onChange?: (priority: Priority) => void;
  className?: string;
};

const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High'];

const map: Record<Priority, { colour: string; label: string }> = {
  High: { colour: 'text-red-500', label: 'High' },
  Medium: { colour: 'text-yellow-500', label: 'Medium' },
  Low: { colour: 'text-green-500', label: 'Low' },
} as const;

export default function PriorityBadge({
  priority,
  editable = false,
  disabled = false,
  onChange,
  className = '',
}: PriorityBadgeProps) {
  const key: Priority = priority || 'Medium';
  const { colour, label } = map[key];

  // Editable mode: render a small select for changing priority
  if (editable && onChange) {
    return (
      <select
        className={`select select-xs select-bordered w-24 ${colour} ${className}`}
        value={priority}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as Priority)}
      >
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  // Read-only badge mode
  return (
    <span className={`badge gap-1 ${className}`}>
      {label}
      <FlagIcon className={`w-4 h-4 ${colour}`} />
    </span>
  );
}
