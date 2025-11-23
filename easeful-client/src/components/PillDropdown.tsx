import { useState, type ReactNode } from 'react';

export type PillDropdownOption<T extends string> = {
	value: T;
	label: string;
	pillClass: string; // background/text/border classes for the pill
	icon?: ReactNode; // optional icon rendered before the label
};

export type PillDropdownProps<T extends string> = {
	value: T;
	options: PillDropdownOption<T>[];
	disabled?: boolean;
	onChange?: (value: T) => void;
	className?: string;
};

export function PillDropdown<T extends string>({
	value,
	options,
	disabled = false,
	onChange,
	className = '',
}: PillDropdownProps<T>) {
	const [open, setOpen] = useState(false);

	// Find the active option, fall back to the first option if value is missing
	const active = options.find((opt) => opt.value === value) ?? options[0];

	if (!active) return null; // nothing to render if no options

	return (
		<div className={`relative inline-block mx-2 ${className}`}>
			<button
				type='button'
				disabled={disabled}
				onClick={() => {
					if (disabled) return;
					setOpen((prev) => !prev);
				}}
				className={`whitespace-nowrap inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer focus:outline-none w-full ${active.pillClass}`}>
				{active.icon && (
					<span className='flex items-center'>{active.icon}</span>
				)}
				<span>{active.label}</span>
			</button>

			{open && (
				<div className='absolute left-0 mt-2 z-20 bg-base-200 shadow-lg rounded-xl py-2 px-0 min-w-full'>
					<ul className='flex flex-col'>
						{options.map((opt) => (
							<li key={opt.value} className='my-1'>
								<button
									type='button'
									className={`flex whitespace-nowrap items-center gap-2 rounded-full px-3 py-1 text-xs font-medium w-full ${opt.pillClass}`}
									onClick={() => {
										onChange?.(opt.value);
										setOpen(false);
									}}>
									{opt.icon && (
										<span className='flex items-center'>{opt.icon}</span>
									)}
									<span>{opt.label}</span>
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
