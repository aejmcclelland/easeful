interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
	return (
		<div className='mb-4'>
			<div className='form-control'>
				<input
					type='text'
					placeholder='Search tasks...'
					className='input input-bordered w-full'
					value={value}
					onChange={(e) => onChange(e.target.value)}
				/>
			</div>
		</div>
	);
}