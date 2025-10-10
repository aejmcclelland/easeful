import { Suspense } from 'react';
import RegisterForm from './RegisterForm';

export const metadata = {
	title: 'Register | Easeful Task Manager',
	description: 'Create your account to start managing tasks with Easeful.',
};

export default function RegisterPage() {
	return (
		<main className='min-h-screen flex items-center justify-center bg-base-200'>
			<div className='card bg-base-100 shadow-xl w-full max-w-md p-8'>
				<h1 className='text-2xl font-semibold text-center mb-6'>
					Create your account
				</h1>

				{/* ✅ Wrap client component using useSearchParams in Suspense */}
				<Suspense fallback={<p>Loading form...</p>}>
					<RegisterForm />
				</Suspense>

				<p className='mt-6 text-center text-sm text-gray-500'>
					Already have an account?{' '}
					<a href='/login' className='link link-primary'>
						Sign in
					</a>
				</p>
			</div>
		</main>
	);
}
