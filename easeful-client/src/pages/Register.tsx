import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerRequest } from '../lib/auth';
import { toastSuccess, toastError } from '../lib/toast';
import { getErrorMessage } from '../lib/getErrorMessage';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
	const [form, setForm] = useState({ name: '', email: '', password: '' });
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const nav = useNavigate();
	const { refresh } = useAuth();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSubmitting(true);

		try {
			await registerRequest(form.name, form.email, form.password);
			await refresh(); // from useAuth
			toastSuccess('Registered successfully', 'registerSuccess');
			nav('/'); // or to /tasks
		} catch (err: unknown) {
			let message = getErrorMessage(err) || 'Registration failed';

			if (message.includes('Duplicate')) {
				message =
					'An account with that email already exists. Try signing in instead.';
			}

			setError(message);
			toastError(message, 'registerError');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className='flex justify-center items-center min-h-screen'>
			<div className='card w-96 bg-base-100 shadow-sm'>
				<div className='card-body'>
					<h2 className='card-title justify-center'>Create account</h2>
					<p className='text-center mb-4'>Register to start using Easeful</p>

					<form onSubmit={onSubmit} className='space-y-3'>
						{error && (
							<div role='alert' className='alert alert-error text-sm'>
								<span>{error}</span>
							</div>
						)}
						<fieldset className='fieldset bg-base-200 border-base-300 rounded-box border p-4'>
							<legend className='fieldset-legend'>Register</legend>

							<label htmlFor='register-name' className='label'>
								Name
							</label>
							<input
								id='register-name'
								className='input w-full'
								placeholder='Your name'
								value={form.name}
								onChange={(e) => {
									setForm({ ...form, name: e.target.value });
									if (error) setError('');
								}}
								disabled={submitting}
								required
							/>

							<label htmlFor='register-email' className='label'>
								Email
							</label>
							<input
								id='register-email'
								type='email'
								className='input w-full'
								placeholder='Email'
								value={form.email}
								onChange={(e) => {
									setForm({ ...form, email: e.target.value });
									if (error) setError('');
								}}
								disabled={submitting}
								required
							/>

							<label htmlFor='register-password' className='label'>
								Password
							</label>
							<input
								id='register-password'
								type='password'
								className='input w-full'
								placeholder='Password'
								value={form.password}
								onChange={(e) => {
									setForm({ ...form, password: e.target.value });
									if (error) setError('');
								}}
								disabled={submitting}
								required
							/>

							<button
								type='submit'
								className='btn btn-neutral w-full mt-4'
								disabled={submitting}>
								{submitting ? 'Registering…' : 'Register'}
							</button>
						</fieldset>
					</form>

					<div className='text-center mt-3'>
						<span className='opacity-70'>Already have an account? </span>
						<a className='link' href='/login'>
							Sign in
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
