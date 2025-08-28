import type { PaginationInfo } from '@/lib/types';

interface PaginationProps {
	pagination: PaginationInfo;
	currentPage: number;
	currentLimit: number;
	total: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (limit: number) => void;
}

export default function Pagination({
	pagination,
	currentPage,
	currentLimit,
	total,
	onPageChange,
	onPageSizeChange
}: PaginationProps) {
	if (pagination.totalPages <= 1) {
		return null;
	}

	return (
		<div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
			<div className='text-sm text-base-content/70'>
				Page {currentPage} of {pagination.totalPages}
				{total > 0 && ` (${total} total)`}
			</div>

			<div className='flex items-center gap-2'>
				{/* Page Size Selector */}
				<div className='form-control'>
					<select
						className='select select-bordered select-sm rounded-full'
						value={currentLimit}
						onChange={(e) => onPageSizeChange(parseInt(e.target.value))}>
						<option value={10}>10 per page</option>
						<option value={20}>20 per page</option>
						<option value={50}>50 per page</option>
					</select>
				</div>

				{/* Pagination Buttons */}
				<div className='join'>
					<button
						className='join-item btn btn-sm rounded-l-full'
						disabled={!pagination.prev}
						onClick={() =>
							pagination.prev && onPageChange(pagination.prev.page)
						}>
						<i className='fas fa-chevron-left'></i>
					</button>
					<button className='join-item btn btn-sm'>
						{currentPage}
					</button>
					<button
						className='join-item btn btn-sm rounded-r-full'
						disabled={!pagination.next}
						onClick={() =>
							pagination.next && onPageChange(pagination.next.page)
						}>
						<i className='fas fa-chevron-right'></i>
					</button>
				</div>
			</div>
		</div>
	);
}