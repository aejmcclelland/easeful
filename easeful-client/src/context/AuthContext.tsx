'use client';

// src/context/AuthContext.tsx
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from './authTypes';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const json = await res.json();
      setUser(json?.data ?? null);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { credentials: 'include' });
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
