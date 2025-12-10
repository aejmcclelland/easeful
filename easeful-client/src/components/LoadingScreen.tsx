export default function LoadingScreen() {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-base-200 px-4 text-center'>
			<div className='bg-base-100 shadow-xl rounded-xl p-8 flex flex-col items-center gap-4 max-w-sm'>
				<span
					className='loading loading-spinner loading-lg text-primary'
					aria-label='Loading'
				/>

				<h2 className='text-lg font-semibold text-base-content'>
					Warming up the server…
				</h2>

				<p className='text-sm text-base-content/70'>
					Thanks for your patience! This project runs on free hosting while I'm
					learning and building 😊
				</p>
			</div>
		</div>
	);
}
