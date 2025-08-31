'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { apiFetch, apiPost } from '@/lib/api';

type MeResponse = { success: boolean; data: { id: string; name: string; email: string } };
type LoginResponse = { success: boolean; token?: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const ac = new AbortController();

    const checkAuth = async () => {
      try {
        // apiFetch throws on non-2xx, so success means authenticated
        await apiFetch<MeResponse>('/api/auth/me', { signal: ac.signal });
        router.replace('/tasks');
        return;
      } catch {
        // Not authenticated; render the form
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
    setLoading(true);

    try {
      await apiPost<LoginResponse>('/api/auth/login', {
        email: email.trim(),
        password,
      });

      // success → go to tasks & refresh so Navbar updates
      router.replace('/tasks');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
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
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Password"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="current-password"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="btn btn-primary btn-lg w-full rounded-full"
          disabled={loading}
        >
          {loading ? (
            'Logging in...'
          ) : (
            <>
              <FontAwesomeIcon icon={faSignInAlt} />
              <span className="ml-2">Login</span>
            </>
          )}
        </button>
      </form>
      <p className="text-center mt-6 text-base">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="link link-primary font-semibold">
          Register here
        </Link>
      </p>
    </div>
  );
}
