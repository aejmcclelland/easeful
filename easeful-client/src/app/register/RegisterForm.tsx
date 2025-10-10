'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1200);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="input input-bordered"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="input input-bordered"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="input input-bordered"
        required
      />
      <button
        type="submit"
        className={`btn btn-primary ${loading ? 'loading' : ''}`}
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>

      {error && <p className="text-error text-sm">{error}</p>}
      {success && <p className="text-success text-sm">{success}</p>}
    </form>
  );
}
