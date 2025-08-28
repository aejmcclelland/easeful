type SortOption =
	| '-createdAt'
	| 'createdAt'
	| 'dueDate'
	| '-priority'
	| '-status';

interface TaskFiltersProps {
	currentSort: SortOption;
	activeStatuses: string[];
	hasActiveFilters: boolean;
	onSortChange: (sort: SortOption) => void;
	onStatusFilter: (statuses: string[]) => void;
	onClearFilters: () => void;
}

export default function TaskFilters({
	currentSort,
	activeStatuses,
	hasActiveFilters,
	onSortChange,
	onStatusFilter,
	onClearFilters
}: TaskFiltersProps) {
	return (
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
						onChange={(e) => onSortChange(e.target.value as SortOption)}>
						<option value='-createdAt'>Newest first</option>
						<option value='createdAt'>Oldest first</option>
						<option value='dueDate'>Due date (soonest first)</option>
						<option value='-priority'>Priority (High first)</option>
						<option value='-status'>Status</option>
					</select>
				</div>

				{/* Clear Filters */}
				{hasActiveFilters && (
					<div className='form-control'>
						<label className='label'>
							<span className='label-text text-sm'>&nbsp;</span>
						</label>
						<button
							onClick={onClearFilters}
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
										onStatusFilter(newStatuses);
									}}
								/>
							</label>
						))}
					</div>
				</details>
			</div>
		</div>
	);
}