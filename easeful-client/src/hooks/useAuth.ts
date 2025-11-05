'use client';

// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthContextType } from '../context/authTypes';

export function useAuth(): AuthContextType {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error('useAuth must be used within <AuthProvider>');
	}
	return ctx;
}
