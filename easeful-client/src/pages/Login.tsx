// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toastSuccess, toastError } from '../lib/toast';
import { loginRequest } from '../lib/auth';
import { getErrorMessage } from '../lib/getErrorMessage';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	const { refresh } = useAuth();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsSubmitting(true);

		try {
			await loginRequest(email, password);
			await refresh();
			toastSuccess('Logged in successfully', 'loginSuccess');
			navigate('/');
		} catch (err: unknown) {
			const message = getErrorMessage(err) || 'Login failed';
			setError(message);
			toastError(message, 'loginError');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='flex justify-center items-center min-h-screen'>
			<div className='card w-96 bg-base-100 shadow-sm'>
				<div className='card-body'>
					<h2 className='card-title justify-center'>Sign In</h2>
					<p className='text-center mb-4'>
						to continue to your Easeful Account
					</p>
					<form onSubmit={onSubmit} className='space-y-3'>
						{error && (
							<div role='alert' className='alert alert-error text-sm'>
								<span>{error}</span>
							</div>
						)}
						<fieldset className='fieldset bg-base-200 border-base-300 rounded-box border p-4'>
							<legend className='fieldset-legend'>Login</legend>

							<label className='label'>Email</label>
							<input
								type='email'
								className='input w-full'
								placeholder='Email'
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									if (error) setError('');
								}}
								disabled={isSubmitting}
								required
							/>

							<label className='label'>Password</label>
							<input
								type='password'
								className='input w-full'
								placeholder='Password'
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									if (error) setError('');
								}}
								disabled={isSubmitting}
								required
							/>

							<button
								type='submit'
								className='btn btn-neutral w-full mt-4'
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Logging in...' : 'Login'}
							</button>
						</fieldset>
					</form>
					<div className='text-center mt-3'>
						<span className='opacity-70'>Don't have an account? </span>
						<a className='link' href='/register'>
							Sign up
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
