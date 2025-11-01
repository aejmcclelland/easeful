//pages/Home.tsx
import React from 'react';export default function Home() {
	return (
		<div className='flex flex-col items-center justify-center min-h-[70vh] text-center'>
			<h1 className='text-4xl font-bold mb-4 text-primary'>
				Welcome to Easeful
			</h1>
			<p className='text-base-content/70 max-w-md mb-6'>
				Organise your day with tasks, reminders, and notes — all in one simple,
				beautiful app.
			</p>

			<div className='flex gap-4'>
				<a href='/login' className='btn btn-primary'>
					Get Started
				</a>
				<a href='/profile' className='btn btn-outline'>
					View Profile
				</a>
			</div>
		</div>
	);
}