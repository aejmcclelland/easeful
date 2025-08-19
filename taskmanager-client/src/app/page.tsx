import Link from 'next/link';

export default function Home() {
	return (
		<section className='prose max-w-none'>
			<h1>Welcome to Taskman</h1>
			<p className='text-base-content/70'>
				A simple task manager powered by your Express API.
			</p>
			<Link className='btn btn-primary mt-4' href='/tasks'>
				View Tasks
			</Link>
		</section>
	);
}