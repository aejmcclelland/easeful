'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, apiPost } from '@/lib/api';

type MeResponse = { success: boolean; data: { id: string; name: string; email: string } };
type RegisterResponse = { success: boolean; token?: string };

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const ac = new AbortController();

    const checkAuth = async () => {
      try {
        await apiFetch<MeResponse>('/api/auth/me', { signal: ac.signal });
        // Authenticated → go straight to tasks
        router.replace('/tasks');
        return;
      } catch {
        // Not authenticated → show form
      } finally {
        if (!ac.signal.aborted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuth();
    return () => ac.abort();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await apiPost<RegisterResponse>('/api/users/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // success → go to tasks & refresh so Navbar updates
      router.replace('/tasks');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything while checking auth to prevent flash
  if (checkingAuth) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          autoComplete="name"
        />
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
          autoComplete="new-password"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="input input-bordered w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="btn btn-primary btn-lg w-full rounded-full"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center mt-6 text-base">
        Already have an account?{' '}
        <Link href="/login" className="link link-primary font-semibold">
          Login here
        </Link>
      </p>
    </div>
  );
}