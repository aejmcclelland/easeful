import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faClipboardList,
	faImage,
	faUsers,
	faMobile,
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
	return (
		<div className='min-h-screen'>
			{/* Hero Section */}
			<section className='hero min-h-[60vh]  from-primary/10 to-secondary/10'>
				<div className='hero-content text-center'>
					<div className='max-w-4xl'>
						<h1 className='text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
							Organize Your Life, One Job at a Time
						</h1>
						<p className='py-6 text-xl text-base-content/80 max-w-2xl mx-auto'>
							Transform chaos into clarity with intelligent task management.
							Priority tracking, rich media support, and seamless collaboration
							- all in one powerful platform.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Link
								className='btn btn-primary btn-lg rounded-full'
								href='/register'>
								Get Started Free
							</Link>
							<Link
								className='btn btn-outline btn-lg rounded-full'
								href='/tasks'>
								View Demo Tasks
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features Preview */}
			<section className='py-4 bg-base-200'>
				<div className='container mx-auto px-4'>
					<h2 className='text-2xl font-bold text-center mb-6'>
						Everything You Need to Stay Productive
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						<div className='card bg-base-100 shadow-sm hover:shadow-md transition-shadow'>
							<div className='card-body text-center'>
								<div className='mb-4 text-primary flex justify-center'>
									<FontAwesomeIcon
										icon={faClipboardList}
										style={{ width: '60px', height: '60px' }}
									/>
								</div>
								<h3 className='card-title text-lg justify-center'>
									Smart Organization
								</h3>
								<p className='text-sm text-base-content/70'>
									Priority levels, status tracking, and custom labels
								</p>
							</div>
						</div>
						<div className='card bg-base-100 shadow-sm hover:shadow-md transition-shadow'>
							<div className='card-body text-center'>
								<div className='mb-4 text-secondary flex justify-center'>
									<FontAwesomeIcon
										icon={faImage}
										style={{ width: '60px', height: '60px' }}
									/>
								</div>
								<h3 className='card-title text-lg justify-center'>
									Rich Media
								</h3>
								<p className='text-sm text-base-content/70'>
									Attach images and files to bring context to your tasks
								</p>
							</div>
						</div>
						<div className='card bg-base-100 shadow-sm hover:shadow-md transition-shadow'>
							<div className='card-body text-center'>
								<div className='mb-4 text-accent flex justify-center'>
									<FontAwesomeIcon
										icon={faUsers}
										style={{ width: '60px', height: '60px' }}
									/>
								</div>
								<h3 className='card-title text-lg justify-center'>
									Team Ready
								</h3>
								<p className='text-sm text-base-content/70'>
									Share tasks and collaborate with your team members
								</p>
							</div>
						</div>
						<div className='card bg-base-100 shadow-sm hover:shadow-md transition-shadow'>
							<div className='card-body text-center'>
								<div className='mb-4 text-info flex justify-center'>
									<FontAwesomeIcon
										icon={faMobile}
										style={{ width: '60px', height: '60px' }}
									/>
								</div>
								<h3 className='card-title text-lg justify-center'>
									Always Accessible
								</h3>
								<p className='text-sm text-base-content/70'>
									Responsive design works perfectly on any device
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
