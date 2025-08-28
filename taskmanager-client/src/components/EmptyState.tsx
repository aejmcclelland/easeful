import Link from 'next/link';

interface EmptyStateProps {
	hasActiveFilters: boolean;
	onClearFilters: () => void;
}

export default function EmptyState({ hasActiveFilters, onClearFilters }: EmptyStateProps) {
	return (
		<div className='text-center py-12'>
			<div className='max-w-md mx-auto'>
				<div className='mb-4'>
					<i className='fas fa-clipboard text-6xl text-gray-400'></i>
				</div>
				{hasActiveFilters ? (
					<>
						<h3 className='text-lg font-medium text-gray-900 mb-2'>
							No tasks match your filters
						</h3>
						<p className='text-gray-500 mb-6'>
							Try adjusting your search criteria or clear the filters.
						</p>
						<button
							onClick={onClearFilters}
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
	);
}