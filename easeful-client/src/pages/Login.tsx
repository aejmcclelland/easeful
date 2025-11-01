// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const { refresh } = useAuth();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Login failed');
			await refresh();
			navigate('/');
		} catch (err) {
			alert('Login failed');
		}
	};
	return (
		<form onSubmit={onSubmit}>
			<input
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder='Email'
			/>
			<input
				type='password'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder='Password'
			/>
			<button type='submit'>Login</button>
		</form>
	);
}
