import type { Task } from '../types/task';
import TaskCard from './TaskCard';

type TaskListProps = {
	tasks: Task[];
	onTaskDeleted?: (id: string) => void;
};

export default function TaskList({ tasks, onTaskDeleted }: TaskListProps) {
	function handleDeleted(id: string) {
		if (onTaskDeleted) onTaskDeleted(id);
	}

	if (!tasks.length) {
		return (
			<div className='text-center text-base-content/70 py-10'>
				<p>No tasks yet.</p>
				<p className='mt-1'>Create your first task using the form above.</p>
			</div>
		);
	}

	return (
		<div className='grid gap-4 md:grid-cols-2'>
			{tasks.map((t) => (
				<TaskCard key={t._id || t.task} task={t} onDeleted={handleDeleted} />
			))}
		</div>
	);
}
