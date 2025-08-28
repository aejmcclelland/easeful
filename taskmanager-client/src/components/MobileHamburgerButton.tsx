interface MobileHamburgerButtonProps {
	isOpen: boolean;
	onClick: () => void;
}

export default function MobileHamburgerButton({ isOpen, onClick }: MobileHamburgerButtonProps) {
	return (
		<button
			onClick={onClick}
			className='btn btn-square btn-ghost'
			aria-label='Toggle mobile menu'>
			<div className='w-6 h-6 flex flex-col justify-center items-center'>
				<span
					className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
						isOpen ? 'rotate-45 translate-y-1.5' : ''
					}`}></span>
				<span
					className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${
						isOpen ? 'opacity-0' : ''
					}`}></span>
				<span
					className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${
						isOpen ? '-rotate-45 -translate-y-1.5' : ''
					}`}></span>
			</div>
		</button>
	);
}